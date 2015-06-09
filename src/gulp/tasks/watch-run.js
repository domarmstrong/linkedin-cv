/**
 * Start the server and watch source files in the same process
 */

import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('watch-run', () => {
  global.watching = true;
  runSequence(['watch', 'bundle', 'run']);
});
