/**
 */

import gulp from 'gulp';
import config from '../gulp/config';
import path from 'path';
import tap from 'gulp-tap';
import childProcess from 'child_process';
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

    let child = childProcess.spawn('node', [
      'node_modules/.bin/mocha',
      '--harmony',
      '--require=./babel_register.js',
      '--require=./test/test_setup.js',
      '--recursive',
      `--reporter=${reporter}`,
    ], {
      env: {
        NODE_ENV: 'test',
        MOCHA_COLORS: true,
      }
    });

    let stream = through.obj().pipe(child.stdout);
    let error = null;

    // Collect error from child process and emit
    child.stderr.on('data', (err) => {
      let str = err.toString().trim();
      if (! str) return;
      d(`ERROR: ${str}`);
      error = error ? error + '\n' + str : str;
    });
    child.on('close', () => {
      if (error) stream.emit('error', new Error(error));
      stream.emit('end');
      stream.end();
    });

    if (reporter === 'json-stream') {
      stream = this.collectJSONStream(stream, error);
    }
    return stream;
  },

  /**
   * Filter and parse json-stream report data
   * if the test run was successful (no fatal errors) save the result to database
   */
  collectJSONStream (stream, error) {
    let results = { streamData: [] };

    stream.on('end', () => {
      if (error) return;
      // If there were no errors save these test results to the database
      // save is left to run and not waited for
      // (test failures are not errors)
      this.saveResult(results);
    });

    // Filter out lines that doe not look like json-stream data
    return stream.pipe(through.obj(function (chunk, enc, done) {
      let lines = chunk.toString().split('\n');
      lines.filter(line => line.trim()).forEach(line => {
        if (/^\["(start|pass|fail|end)"/.test(line)) {
          this.push(line, enc);
          results.streamData.push(JSON.parse(line));
        } else {
          d('IGNORED: ', line);
        }
      });
      done();
    }));
  },

  /**
   * Run the full test suit in this node process
   * ignore failures etc
   * @returns {Promise}
   */
  runForCoverage () {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Only run in test env');
    }
    return new Promise((resolve, reject) => {
      let mocha = new Mocha();

      let src = gulp.src(config.test.src).pipe(tap(f => {
        mocha.addFile(f.path);
      }));

      src.on('end', () => {
        mocha.run(failures => {
          // dont care about failures
          resolve(failures);
        });
      });
    });
  },

  saveResult (result) {
    return db.collection('tests').insert(result).then(saved => {
      d('Saved test result', saved._id);
      return saved;
    }).catch(err => {
      // TODO: error log
      console.error('Error: ', err);
    });
  },

  getLastResult () {
    return db.collection('tests').find().sort( { _id : -1 } ).limit(1).then(result => {
      let testResult = result[0];
      if (! testResult) return { streamData: [] };
      return testResult;
    });
  },
}
