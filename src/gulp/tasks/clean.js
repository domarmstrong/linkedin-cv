/**
 * Tasks to clean up the working directory
 */

import gulp from 'gulp';
import clean from 'gulp-clean';
import config from '../config';

/**
 * Removed compiled files
 */
gulp.task('clean', function () {
  gulp.src(config.less.dest, { read: false }).pipe(clean());
  gulp.src('./node_modules/install.stamp', { read: false }).pipe(clean());
});

/**
 * Hard reset the working directory including compiled files and node_modules
 **/
gulp.task('veryclean', ['clean'], function () {
  return gulp.src('./node_modules', { read: false })
    .pipe(clean());
});

