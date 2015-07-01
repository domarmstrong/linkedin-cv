"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * A wrapper around superagent-promise
 */

// TODO write tests....
import superagent from 'superagent';
import superagentPromise from 'superagent-promise';

// Note: MAKE SURE config is not included in client bundle
// should only be required for server code
import config from '../config';

let agent = superagentPromise(superagent, Promise);

/**
 * If the path starts with '/' convert it to an absolute localhost url.
 * This transformation is ignored for the browser where relative paths are correct.
 *
 * @example:
 * ```
 * toAbsoluteUrl('/home') // http://localhost/home
 * ```
 *
 * @param url {String}
 * @returns {String}
 */
export function toAbsoluteUrl (url) {
  // TODO make more robust pattern match?
  if (!process.browser && url[0] === '/') {
    return 'http://localhost:' + config.app_port + url;
  }
  return url;
}

/**
 * Export an agent with all methods extended to use absolute urls
 */
export default function Agent(method, url, ...args) {
  let req = Agent.agent(method, toAbsoluteUrl(url), ...args);
  if (Agent.cookies) {
    req = req.set('cookie', Agent.cookies);
  }
  return req;
}
Object.keys(agent).forEach(key => {
  Agent[key] = function (url, ...args) {
    return this(key.toUpperCase(), toAbsoluteUrl(url), ...args);
  };
});

let cache = {};

Object.assign(Agent, {
  cookies: null,

  /**
   * Return the original unwrapped agent. Allows for mocking with tests.
   */
  get agent () {
    return agent;
  },

  /**
   * Make a request to the server for http headers and save the returned cookie
   * the cookie will then be used for all following requests
   *
   * This function is used for testing purposes as superagent does not aautomatically
   * persist cookies in node.
   */
  getCookies () {
    return this.get('/api/header').then(res => {
      this.cookies = res.headers['set-cookie'].map(cookie => {
        let cooky = /^.*?=.*?;/.exec(cookie);
        return cooky && cooky[0];
      }).join(' ');
    })
  },

  get (url) {
    let req = this('GET', toAbsoluteUrl(url));
    let then = req.then;
    req.then = function (resolve, reject) {
      return then.call(req, function (res) {
        cache[url] = res;
        return resolve(res);
      }).catch(reject);
    };

    return req;
  },

  /**
   * If a request with the same url has been made already return its result
   * else make a new request
   * @param url
   */
  getCached (url) {
    if (cache[url]) {
      return Promise.resolve(cache[url]);
    } else {
      return this.get(url);
    }
  }
});
