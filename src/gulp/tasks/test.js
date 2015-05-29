/**
 * Run project tests
 *
 * By default runs all tests or with argument -f/--file
 *
 * args:
 * `-f / --file [file path]`: Only run this individual test file
 */

import gulp from 'gulp';
import config from '../config';
import mocha from 'gulp-mocha';
import minimist from 'minimist';
import path from 'path';

gulp.task('test', function () {
  let argv = minimist(process.argv.slice(2));
  let src = argv.f || argv.file || config.test.src;
  return gulp.src(src, { read: false }).pipe(mocha(config.test.mochaOpts));
});