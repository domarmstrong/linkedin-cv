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
  return Agent.agent(method, toAbsoluteUrl(url), ...args);
}
Object.keys(agent).forEach(key => {
  Agent[key] = function (url, ...args) {
    return this.agent[key](toAbsoluteUrl(url), ...args);
  };
});

let cache = {};

Object.assign(Agent, {
  /**
   * Return the original unwrapped agent. Allows for mocking with tests.
   */
  get agent () {
    return agent;
  },

  get (url) {
    let req = this.agent('GET', toAbsoluteUrl(url));

    return req.then(res => {
      cache[url] = res;
      return Promise.resolve(res);
    });
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
