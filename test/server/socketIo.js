"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import socketIo from '../../src/server/socketIo';
import io from 'socket.io-client';
import test from '../../src/server/test';
import through from 'through2';

describe('socketIo', () => {
  let port = 8082;
  let url = 'http://127.0.0.1:' + port;
  let opts = {
    transports: ['websocket'],
    'force new connection': true,
  };

  before(() => {
    socketIo(port);
  });

  describe('runTests', () => {
    let stream;

    beforeEach(() => {
      stream = through();
      sinon.stub(test, 'run').returns(stream);
    });
    afterEach(() => {
      test.run.restore();
    });

    it('streams test results to the client', done => {
      let socket = io.connect(url, opts);
      let i = 0;
      socket.on('test-start', () => {
        stream.push('{ "a": 1 }');
        stream.push('{ "b": 2 }');
        stream.push('{ "c": 3 }');
        stream.end();
      });
      socket.on('test-result', data => {
        if (i === 0) assert.deepEqual(data, { a: 1 });
        if (i === 1) assert.deepEqual(data, { b: 2 });
        if (i === 2) assert.deepEqual(data, { c: 3 });
        i++;
      });
      socket.on('test-end', done);

      socket.emit('run-tests');
    });

    it('emits test-error on error', done => {
      let socket = io.connect(url, opts);
      let i = 0;
      socket.on('test-start', () => {
        stream.emit('error', new Error('foo'));
        stream.end();
      });
      socket.on('test-error', err => {
        assert.equal(err, 'foo');
        done();
      });
      socket.emit('run-tests');
    });
  });

  describe('error', () => {
    beforeEach(() => {
      sinon.stub(test, 'run').throws(new Error('foo'));
    });
    afterEach(() => {
      test.run.restore();
    });

    it('emits an error to the client if something went wrong', done => {
      let socket = io.connect(url, opts);
      socket.on('server-error', error => {
        assert.equal(error, 'Oops something went wrong');
        done();
      });

      socket.emit('run-tests');
    });
  });
});
