"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import io from 'socket.io-client';

export default class Client {
  constructor () {
    this._socket = null;
    this.router = null;
  }

  /**
   * Initialise the client/router
   * @returns {Promise}
   */
  init () {
    if (process.browser) {
      // Using require here to solve some caching issue when using Istanbul code coverage
      let router = require('./router');
      return router.init().then(router => this.router = router);
    } else {
      return Promise.resolve();
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
