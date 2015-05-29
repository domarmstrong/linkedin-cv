/**
 * Start the server using supervisor
 *
 * Changes made to source files while the server is running
 * will trigger a server restart with the updates files
 *
 * Note: This task is for development only. Use supervisord in production
 * http://supervisord.org/
 */

import gulp from 'gulp';
import supervisor from 'gulp-supervisor';
import config from '../config';

gulp.task('run', ['less'], function () {
  // Start server
  supervisor(config.run.entry, {
    harmony: true, // Enable harmony with generator support for Koa
    watch: config.run.watch, // Watch src for any changes
    extensions: config.run.extensions, // Add file extensions to watch
  });
});
