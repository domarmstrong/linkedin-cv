/**
 */

import gulp from 'gulp';
import config from '../gulp/config';
import path from 'path';
import tap from 'gulp-tap';
import { spawn } from 'child_process';
import stream from 'stream';
import through from 'through2';
import { db } from './db';
import debug from 'debug';
import Mocha from 'mocha';

const d = debug('linkedIn-cv:test');

export default {
  /**
   * Run all tests with mocha
   * @returns {Stream}
   */
  run (reporter) {
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
    let error = false;

    // Collect error from child process and emit
    child.stderr.on('data', (err) => {
      let str = err.toString().trim();
      if (! str) return;
      d(`ERROR: ${str}`);
      error += str;
    });
    child.on('close', () => {
      if (error) stream.emit('error', new Error(error));
      stream.end();
    });

    if (reporter === 'json-stream') {
      let results = { streamData: [] };

      child.on('close', code => {
        // Not using exit code as it seems to return 1 when no error occured
        if (error) return;
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

  /**
   * Run the full test suit in this node process
   * ignore failures etc
   * @returns {Promise}
   */
  runForCoverage () {
    return new Promise((resolve, reject) => {
      let mocha = new Mocha();

      let src = gulp.src('./test/**/*.js').pipe(tap(f => {
        mocha.addFile(f.path);
      }));

      src.on('end', () => {
        try {
          mocha.run(failures => {
            // dont care about failures
            resolve(failures);
          });
        } catch (err) {
          reject(err);
        }
      });
    });
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
    d('Run promise');
    return new Promise((resolve, reject) => {
      let stream = this.run();
      stream.on('data', data => process.stdout.write(data.toString()));
      stream.on('error', err => { d('Test error', err); reject(err) });
      stream.on('end', resolve);
    });
  },

  /**
   * Run all tests with mocha return collected json-stream report
   * @returns {Promise,JSON}
   */
  jsonReport () {
    return new Promise((resolve, reject) => {
      let buffer = [];
      let stream = this.run('json-stream');
      stream.on('data', data => buffer.push(JSON.parse(data.toString())));
      stream.on('error', err => { d('Test error', err); reject(err) });
      stream.on('end', resolve(buffer));
    });
  }
}
