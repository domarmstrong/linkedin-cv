'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * The default task that is run with 'gulp'.
 */
gulp.task('default', ['bundle','vendor','less']);

/**
 * Removed compiled files.
 */
gulp.task('clean', function () {
  var clean = require('gulp-clean');
  gulp.src('./build', { read: false }).pipe(clean());
  gulp.src('./bundle.js', { read: false }).pipe(clean());
  gulp.src('./node_modules/install.stamp', { read: false }).pipe(clean());
});

/**
 * Remove compiled files and installed node modules.
 */
gulp.task('veryclean', ['clean'], function () {
  var clean = require('gulp-clean');
  return gulp.src('./node_modules', { read: false })
    .pipe(clean());
});

/**
 * Compile less to css.
 *
 * Files will be compiled from `src/css` to `build/main.css`.
 */
gulp.task('less', function () {
  var less = require('gulp-less');
  var minifyCSS = require('gulp-minify-css');

  return gulp.src('./src/less/main.less')
    .pipe(less())
    .on('error', function (err) {
      console.error('Less error: ' + err.message);
      this.emit('end');
    })
    .pipe(minifyCSS({
      keepBreaks: true,
      keepSpecialComments: 0,
    }))
    .on('error', function (err) {
      console.error('CSS minify error: ' + err.message);
      this.emit('end');
    })
    .pipe(gulp.dest('./build'));
});

gulp.task('watch-run', ['watch', 'run']);

gulp.task('watch', ['less'], function () {
  gulp.watch('./src/less/*', ['less']);
});

gulp.task('run', function () {
  var supervisor = require('gulp-supervisor');

  // Start server
  supervisor('./test', {
    harmony: true,
    args: [],
    watch: [ './src' ],
    extensions: [ '.jsx', '.js' ],
    ignore: [ './build' ]
  });
});
