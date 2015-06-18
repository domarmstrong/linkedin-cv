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

    socket.on('run-tests', () => {
      let stream = test.run('json-stream');
      stream.on('data', d => {
        socket.emit('test-result', JSON.parse(d.toString()));
      });
      stream.on('error', err => {
        console.error(err);
        socket.emit('test-error', err.message);
      })
    });
  });
}
