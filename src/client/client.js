"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import router from './router';
import io from 'socket.io-client';

export default class Client {
  constructor () {
    console.info('Bootstrap client');
    this._socket = null;
  }

  init () {
    if (process.browser) {
      router.init();
    }
  }

  /**
   * Get a socket connection
   * @returns {socket}
   */
  get socket () {
    if (! this._socket) this._socket = io();
    return this._socket;
  }
}
