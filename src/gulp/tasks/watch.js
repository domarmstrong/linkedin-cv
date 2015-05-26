/**
 * Watch source files for changes and recompile on change
 */

import gulp from 'gulp';

gulp.task('watch', ['less'], function () {
  gulp.watch('./src/less/**/*', ['less']);
});
