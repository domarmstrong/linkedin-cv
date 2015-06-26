"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import socketIo from '../../src/server/socketIo.js';
import test from '../../src/server/test';

/*
describe('test', () => {
  let child;

  beforeEach(() => {
    // stub childProcess.spawn
    childProcess.spawn = function (cmd, args, opts) {
      child = new EventEmitter();
      Object.assign(child, {
        stdout: through(),
        stderr: through(),
      });
      return child;
    }
  });
  afterEach(() => {
    childProcess.spawn = SPAWN;
  });

  describe('run', () => {
    it('handles output from stderr', done => {
      let onError = sinon.stub();
      let stream = test.run();
      stream.on('error', onError);
      stream.on('end', () => {
        assert(onError.calledOnce);
        done();
      });

      child.stderr.emit('data', new Buffer(new Error('foo').stack));
      child.emit('close', 0);
    });

    it('ignores blank lines from stderr', done => {
      let onError = sinon.stub();
      let stream = test.run();
      stream.on('error', onError);
      stream.on('end', () => {
        assert.equal(onError.args[0][0].message, 'test error\nline 2');
        done();
      });

      child.stderr.emit('data', new Buffer('\n'));
      child.stderr.emit('data', new Buffer('test error'));
      child.stderr.emit('data', new Buffer('\n  \n'));
      child.stderr.emit('data', new Buffer('\nline 2'));
      child.emit('close', 0);
    });

    context('with json-steam reporter', () => {
      beforeEach(() => sinon.stub(test, 'collectJSONStream'));
      afterEach(() => sinon.restore(test, 'collectJSONStream'));

      it('runs collectJSONStream', () => {
        test.run('json-stream');
        assert(test.collectJSONStream.called, 'collectJSONStream was not called')
      });
    });
  });

  describe('collectJSONStream', () => {
    it('handles multiple lines in one chunk', () => {
      let stream = through();
      let jsonStream = test.collectJSONStream(stream, null);
      let data = [];
      jsonStream.on('data', d => data.push(d));

      stream.emit('data', new Buffer('["pass"]\n["pass"]'));
      assert.deepEqual(data, ['["pass"]', '["pass"]']);
    });

    it('ignores lines that are not json-stream output', () => {
      let stream = through();
      let jsonStream = test.collectJSONStream(stream, null);
      let data = [];
      jsonStream.on('data', d => data.push(d));

      stream.emit('data', new Buffer('["start"]'));
      stream.emit('data', new Buffer('["pass"]'));
      stream.emit('data', new Buffer('some console.log'));
      stream.emit('data', new Buffer('{ logged: "object" }'));
      stream.emit('data', new Buffer('["fail"]'));
      stream.emit('data', new Buffer('["end"]'));

      assert.deepEqual(data, ['["start"]', '["pass"]', '["fail"]', '["end"]']);
    });

    context('on end', () => {
      beforeEach(() => sinon.stub(test, 'saveResult'));
      afterEach(() => sinon.restore(test, 'saveResult'));

      it('runs save', () => {
        let stream = through();
        let jsonStream = test.collectJSONStream(stream);

        stream.emit('end');

        assert(test.saveResult.called, 'test.saveResult should be called');
      });

      it('does not save if an error occured', () => {
        let stream = through();
        let jsonStream = test.collectJSONStream(stream, new Error('foo'));

        stream.emit('end');

        assert(test.saveResult.notCalled, 'test.saveResult should not be called');
      });
    });
  });

  describe('runForCoverage', () => {
    it('returns a promise', () => {
      return test.runForCoverage();
    });
  });

  describe('saveResult', () => {
    it('writes result to mongo', () => {
      return test.saveResult({ streamData: [
        ['start'], ['pass'], ['end'],
      ]}).then(saved => {
        assert.isDefined(saved._id);
      });
    });
  });

  describe('getLastResult', () => {
    beforeEach(() => {
      return test.saveResult({ streamData: [
        ['start'], ['pass'], ['end'],
      ]});
    });

    it('returns the last saved result', () => {
      return test.getLastResult().then(result => {
        assert.deepEqual(result.streamData, [
          ['start'], ['pass'], ['end'],
        ]);
        assert.isDefined(result._id);
      });
    })
  });
});
*/
