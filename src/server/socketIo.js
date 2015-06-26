"use strict";

/**
 * Author: Dom Armstrong, Date: 17/06/15
 */

import socketIo from 'socket.io';
import test from './test';

export default function socketIoInit (server) {
  let io = socketIo(server);

  io.on('connection', socket => {
    console.log('Socket connected');

    socket.on('run-tests', runTests);
  });
}

export function runTests (socket) {
  test.run('json-stream')
    .on('data', d => {
      this.emit('test-result', JSON.parse(d.toString()));
    })
    .on('error', err => {
      console.error(err);
      this.emit('test-error', err.message);
    });
}
