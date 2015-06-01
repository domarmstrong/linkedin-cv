/**
 * Run project tests
 *
 * By default runs all tests or with argument -f/--file
 *
 * args:
 * `-f / --file [file path]`: Only run this individual test file
 */

import gulp from 'gulp';
import minimist from 'minimist';
import test from '../../server/test';

gulp.task('test', function () {
  let argv = minimist(process.argv.slice(2));
  let pipe = test.run(null, argv.f || argv.file);
  pipe.pipe(process.stdout);
  return pipe;
});
