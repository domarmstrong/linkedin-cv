/**
 * Note: This task requires node to be running with --harmony
 * In order to run gulp with harmony use the following:
 * ```
 * node --harmony `which gulp` coverage
 * ```
 */

import gulp from 'gulp';
import config from '../config';
import mocha from 'gulp-mocha';
import path from 'path';
import { transform as babel } from 'babel';
import istanbul from 'istanbul';
import istanbulSourceMap from 'istanbul-coverage-source-map';
import tap from 'gulp-tap';

gulp.task('coverage', ['clean'], function () {
  let instrumenter = new istanbul.Instrumenter({ coverageVariable: 'coverage_id' });
  let collector = new istanbul.Collector();
  let reporter = new istanbul.Reporter(null, './build/coverage');
  let conf = config.coverage;

  let instrumented = {};
  let sourceMaps = {};

  istanbul.hook.hookRequire(
    // Should the require call be transformed?
    file => file in instrumented,
    // Return the transformed code
    (code, file) => instrumented[file],
    // Options
    {}
  );

  let ignore = conf.ignore.map(glob => '!' + glob);
  let sources = conf.cover.concat(ignore);

  return gulp.src(sources)
    .pipe(tap(f => {
      let relative = path.join('./', f.path.replace(path.join(process.cwd(), 'src'), ''));
      sourceMaps[f.path] = './' + path.join(conf.mapDir, relative + '.map');
      let transformed = babel(f.contents.toString(), {
        sourceMaps: true,
        sourceFileName: './' + relative,
        sourceMapName: path.basename(relative) + '.map',
        sourceRoot: './src',
        //optional: ["runtime"]
      });
      instrumented[f.path] = instrumenter.instrumentSync(transformed.code, f.path);
      f.path += '.map';
      f.contents = new Buffer(JSON.stringify(transformed.map, null, 2));
    }))
    .pipe(gulp.dest(conf.mapDir))
    .on('end', () => {
      return gulp.src(sources, { read: false })
        .pipe(tap(f => delete require.cache[path.resolve(f.path)]))
        .pipe(tap(f => require(f.path)))
        .on('end', () => {
          return gulp.src(config.test.src, { read: false })
            .pipe( mocha({ reporter: 'spec' }) )
            .on('end', () => {
              let coverage = JSON.parse(
                istanbulSourceMap(
                  global['coverage_id'],
                  { sourceMaps: sourceMaps }
                )
              );
              collector.add(coverage);

              reporter.addAll(['html', 'text', 'text-summary']);
              reporter.write(collector, true, () => console.log('done'));
            });
        } );
    });
});
