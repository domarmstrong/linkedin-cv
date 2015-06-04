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
gulp.task('coverage', ['clean'], function () {
  // Spawn a new child process running with harmony and run the coverage file
  // Get the absolute path so the file we want to run
  let taskPath = path.resolve(process.cwd(), 'src/server/coverage');
  // Use babel register to parse the file and require the file executing its default function
  let init = `
    require('babel/register');
    require('${ taskPath }')().then(function () {
      // Resolve hanging process
      process.nextTick(function () { process.exit(0) });
    })
  `;
  let child = spawn('node', ['--harmony', '--harmony-proxies', '-e', init], { stdio: 'inherit' });
  child.on('close', code => process.exit(code));
});
