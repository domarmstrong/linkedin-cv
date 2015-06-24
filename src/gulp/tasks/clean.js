/**
 * Tasks to clean up the working directory
 */

import gulp from 'gulp';
import clean from 'gulp-clean';
import config from '../config';

/**
 * Remove generated files
 */
gulp.task('clean', function () {
  return gulp.src(['./build', './node_modules/install.stamp'], { read: false }).pipe(clean());
});

gulp.task('cleancoverage', function () {
  return gulp.src(['./build/coverage', './build/maps'], { read: false }).pipe(clean());
});

/**
 * Hard reset the working directory including compiled files and node_modules
 **/
gulp.task('veryclean', ['clean'], function () {
  return gulp.src('./node_modules', { read: false }).pipe(clean());
});
