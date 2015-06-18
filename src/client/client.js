"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import router from './router';
import io from 'socket.io-client';

// Client is a singleton in the browser to this isn't a problem
let socket = null;

export default class Client {
  constructor () {
    console.info('Bootstrap client');
    router.init();
  }

  /**
   * Get a socket connection
   * @returns {socket}
   */
  get socket () {
    if (! socket) socket = io();
    return socket;
  }
}
