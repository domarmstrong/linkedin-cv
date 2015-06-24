"use strict";

import { assert } from 'chai';
import test from '../../src/server/test.js'
import childProcess from 'child_process';
import through from 'through2'

let SPAWN = childProcess.spawn;

describe('test', () => {
  let childOut;

  beforeEach(() => {
    // stub childProcess.spawn
    childOut = through();
    childProcess.spawn = function (cmd, args, opts) {
      return {
        stdout: childOut,
        stderr: {
          on (evenName, fn) { }
        },
        on (eventName, fn) { }
      };
    }
  });
  afterEach(() => {
    childProcess.spawn = SPAWN;
  });

  describe('run', () => {
    context('with json-stream reporter', () => {
      it('handles multiple lines in one chunk', done => {
        let stream = test.run('json-stream');
        stream.on('error', done);
        childOut.on('end', done);

        childOut.emit('data', new Buffer('["pass"]\n["pass"]'));
        childOut.end();
      });
    });
  });
});
