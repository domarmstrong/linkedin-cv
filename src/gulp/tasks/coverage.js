/**
 * Create code coverage reports
 */

import gulp from 'gulp';
import path from 'path';
import { spawn } from 'child_process'

/**
 * Since this task requires --harmony and gulp does not run with harmony by default
 * we can get around this by spawning a child process that runs with harmony
 */
gulp.task('coverage', ['cleancoverage'], function () {
  // Spawn a new child process with --harmony and run the coverage file
  // Get the absolute path
  let taskPath = path.resolve(process.cwd(), 'src/gulp/coverage');
  // Use babel register, require the file executing its default export
  let init = `
    require('./babel_register');
    require('${ taskPath }')().catch(function (err) {
      console.error('ERROR:', err.stack);
    }).then(function () {
      // Resolve hanging process
      process.nextTick(function () { process.exit(0) });
    });
  `;
  let child = spawn('node', ['--harmony', '-e', init], { stdio: 'inherit', env: { NODE_ENV: 'test', MOCHA_COLORS: true } });
  child.on('close', code => process.exit(code));
});
