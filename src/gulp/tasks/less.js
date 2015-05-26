import gulp from 'gulp';
import less from 'gulp-less';
import minify from 'gulp-minify-css';
import config from '../config';

/**
 * Compile less to css and minify the result
 *
 * The entry point file is `src/less/main.less`
 *
 * Files will be compiled from `src/less/main.less` to `build/main.css`.
 */
gulp.task('less', function () {

  return gulp.src(config.less.entry)
    .pipe(less())
    .on('error', function (err) {
      console.error('Less error: ' + err.message);
      this.emit('end');
    })
    .pipe(minify({
      keepBreaks: true,
      keepSpecialComments: 0,
    }))
    .on('error', function (err) {
      console.error('CSS minify error: ' + err.message);
      this.emit('end');
    })
    .pipe(gulp.dest(config.less.dest));
});

