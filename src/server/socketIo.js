"use strict";

/**
 * Author: Dom Armstrong, Date: 17/06/15
 */

import socketIo from 'socket.io';
import log from './log';
import { AsyncQueue } from '../lib/asyncQueue';
import time from '../lib/time';
import once from 'lodash/function/once';

let testQueue = new AsyncQueue();

export default function socketIoInit (server) {
  let io = socketIo(server);

  io.on('connection', socket => {
    log.debug('Socket connected');

    socket.on('run-tests', runTests);
    socket.on('error', err => {
      log.error(err);
      socket.emit('server-error', 'Oops something went wrong');
    });
  });
}

let waitTime = 0;
let runs = 0;

function getAverageWait() {
  return time.renderDuration(waitTime / (runs || 1));
}

export function runTests () {
  let socket = this;
  let id = socket.id;
  let data = {
    socket,
    startTime: +new Date(),
  };

  testQueue.push(id, data, (id, data, position, done) => {

    if (done) {
      // Log how long it took before running
      waitTime += +new Date() - data.startTime;
      runs++;

      doTestRun(data.socket, done);
    } else {
      socket.emit('test-info', `Queue position: ${ position } (Average wait ${ getAverageWait() })`);
    }
  });
}

function doTestRun (socket, done) {
  // Do import here due to issue with istanbul instrumented code..
  let test = require('./test');
  // test-start is a testing hook
  socket.emit('test-start');

  test.run('json-stream')
    .on('data', d => {
      socket.emit('test-result', JSON.parse(d.toString()));
    })
    .on('error', err => {
      log.error('test-error', err);
      socket.emit('test-error', err.message);
    })
    .on('end', once(() => {
      // test-end is a testing hook
      socket.emit('test-end');
      done();
    }));

  socket.emit('test-info', 'Test run initialized');
  socket.emit('test-info', 'Awaiting test data...');
}
