"use strict";

/**
 * Author: Dom Armstrong, Date: 17/06/15
 */

import socketIo from 'socket.io';
import log from './log';

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

export function runTests (socket) {
  // Do import here due to issue with istanbul instrumented code..
  let test = require('./test');

  test.run('json-stream')
    .on('data', d => {
      this.emit('test-result', JSON.parse(d.toString()));
    })
    .on('error', err => {
      log.error('test-error', err);
      this.emit('test-error', err.message);
    })
    .on('end', () => {
      this.emit('test-end');
    });

  this.emit('test-start');
}
