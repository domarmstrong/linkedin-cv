/**
 * Create the main client bundle. This is the entry point for the client
 */

import browserify from 'browserify';
import watchify from 'watchify';
import gulp from 'gulp';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import config from '../config';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import _ from 'underscore';
import envify from 'envify';

const PRODUCTION = process.env.NODE_ENV === 'production';

function bundle (config) {
  return new Promise((resolve, reject) => {
    let opts = _.extend({
      // Required watchify args
      cache: {},
      packageCache: {},
      fullPaths: false,
      debug: true
    }, config.browserifyOpts);

    let bundler = browserify(opts)
      .exclude('./config.js')
      .external(config.external)
      .require(config.require)
      .transform(babelify.configure({ stage: 1 }));

    function makeBundle() {
      gutil.log('Start bundling', config.bundleName);

      let bundle = bundler
        .bundle()
        // Report compile errors
        .on('error', reject)
        .pipe(envify())
        // Use vinyl-source-stream to make the
        // stream gulp compatible. Specifiy the
        // desired output filename here.
        .pipe(source(config.bundleName))
        .pipe(buffer())
        // Create independent source map file in the build directory
        .pipe(sourcemaps.init({ loadMaps: true }));

      if (PRODUCTION) {
        gutil.log('Uglify', config.bundleName);
        bundle = bundle.pipe(uglify('client.js', { outSourceMap: true }))
          .on('data', function (data) {
            gutil.log('Uglify', data.path);
          })
      }

      // Specify the output destination
      bundle.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest))
        .on('end', () => {
          gutil.log('End bundling', config.bundleName);
          resolve();
        });
    }

    if (global.isWatching) {
      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);
      // Rebundle on update
      bundler.on('update', makeBundle);
    }
    makeBundle();
  });
}

gulp.task('bundle', ['app-bundle', 'vendor-bundle']);

gulp.task('app-bundle', function() {
  return bundle(config.bundle.app);
});

gulp.task('vendor-bundle', function() {
  return bundle(config.bundle.vendor);
});

