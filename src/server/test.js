/**
 */

import gulp from 'gulp';
import config from '../gulp/config';
import path from 'path';
import promisePipe from 'promisepipe';
import tap from 'gulp-tap';
import { spawn } from 'child_process';
import stream from 'stream';
import through from 'through2';
import { db } from './db';
import debug from 'debug';

const d = debug('linkedIn-cv:test');

export default {
  /**
   * Run all tests with mocha
   * @returns {Stream}
   */
  run (reporter, files) {
    reporter = reporter || config.test.mochaOpts.reporter;

    d(`Run tests with reporter: "${reporter}"`);

    let child = spawn('node', [
      '--harmony',
      'node_modules/.bin/mocha',
      '--require=./babel_register.js',
      '--recursive',
      `--reporter=${reporter}`,
    ], {
      env: { 'MOCHA_COLORS': true }
    });

    let stream = through.obj().pipe(child.stdout);
    let errored = false;

    // Collect error from child process and emit
    child.stderr.on('data', (error) => {
      let str = error.toString().trim();
      if (! str) return;
      errored = true;
      stream.emit('error', new Error(str));
    });
    child.on('close', () => stream.end());

    if (reporter === 'json-stream') {
      let results = { streamData: [] };

      child.on('close', code => {
        // Not using exit code as it seems to return 1 when no error occured
        if (errored) return; // Process errored
        this.saveResult(results);
      });

      // Filter out lines that doe not look like json-stream data
      stream = stream.pipe(through.obj(function (chunk, enc, done) {
        if (/^\["(start|pass|fail|end)"/.test(chunk)) {
          this.push(chunk, enc);
          results.streamData.push(JSON.parse(chunk.toString()));
        } else {
          d('IGNORED: ', chunk);
        }
        done();
      }));
    }
    return stream;
  },

  saveResult (result) {
    db.collection('tests').insert(result).then(info => {
      d('Saved test result', info._id);
    }).catch(err => {
      // TODO: error log
      console.error('Error: ', err);
    });
  },

  getLastResult () {
    return db.collection('tests').findOne({}, { sort: { _id: -1 } });
  },

  /**
   * Run all tests with mocha
   * @returns {Promise}
   */
  runPromise () {
    return promisePipe( this.run );
  },

  /**
   * Run all tests with mocha return collected json-stream report
   * @returns {Promise,JSON}
   */
  jsonReport () {
    let buffer = [];
    let testStream = this.run('json-stream');
    testStream.on('data', d => buffer.push(JSON.parse(d.toString())));

    return promisePipe( testStream ).then(() => buffer);
  }
}
