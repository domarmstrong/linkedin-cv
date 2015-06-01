/**
 */

import gulp from 'gulp';
import config from '../gulp/config';
import path from 'path';
import promisePipe from 'promisepipe';
import Q from 'q';
import tap from 'gulp-tap';
import { spawn } from 'child_process';
import stream from 'stream';
import through from 'through2';


export default {
  /**
   * Run all tests with mocha
   * @returns {Stream}
   */
  run (reporter, files) {
    reporter = reporter || config.test.mochaOpts.reporter;

    let child = spawn('node', [
      '--harmony',
      'node_modules/.bin/mocha',
      '--compilers=js:babel/register',
      '--recursive',
      `--reporter=${reporter}`,
    ], {
      env: { 'MOCHA_COLORS': true }
    });

    let stream = through.obj().pipe(child.stdout);

    // Collect error from child process and emit
    child.stderr.on('data', (error) => {
      let err = new Error();
      err.stack = error.toString();
      err.message = /Error: (.*)/.exec(err.stack);
      err.message = err.message ? err.message[1] : null;
      stream.emit('error', err);
    });
    child.on('close', code => stream.end());

    if (reporter === 'json-stream') {
      // Filter out lines that doe not look like json-stream data
      stream = stream.pipe(through.obj(function (chunk, enc, done) {
        if (/^\["(start|pass|fail|end)"/.test(chunk)) {
          this.push(chunk, enc);
        } else {
          console.info('IGNORED: ', chunk);
        }
        done();
      }));
    }
    return stream;
  },

  /**
   * Run all tests with mocha
   * @returns {Promise}
   */
  jsonReport () {
    let buffer = [];
    let testStream = this.run('json-stream');
    testStream.on('data', d => buffer.push(JSON.parse(d.toString())));

    return promisePipe( testStream ).then(() => buffer);
  }
}
