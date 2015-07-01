"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import io from 'socket.io-client';
import request from '../request';

export default class Client {
  constructor () {
    this._authenticated = false;
    this._socket = null;
    this.router = null;
  }

  /**
   * Initialise the client/router
   * @returns {Promise, [void]}
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
    if (! this._socket) {
      this._socket = io();
      this._socket.on('server-error', error => {
        console.error(error);
      });
    }
    return this._socket;
  }

  /**
   * @param username
   * @param password
   * @returns {Promise}
   */
  login (username, password) {
    return request.post('/auth/login')
      .type('json')
      .accept('json')
      .send({ username, password })
      .then(res => {
        return true;
      }).catch(err => {
        this._authenticated = false;
        if (err.message === 'Unauthorized') {
          err.message = err.response.text;
        }
        throw err;
      });
  }

  logout () {
    return request.post('/auth/logout')
      .then(() => {
        this._authenticated = false;
      });
  }

  /**
   * Purely for convenience and should not be considered 'security'
   * All security must be checked on the server
   * @returns {Promise, [Boolean]}
   */
  isAuthenticated () {
    if (this._authenticated) return Promise.resolve(true);
    return request.get('/auth/is-authenticated')
      .then(res => res.body)
      .then(authenticated => {
        if (authenticated) this._authenticated = true;
        return authenticated;
      });
  }
}
