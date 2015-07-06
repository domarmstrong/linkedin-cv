"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * A wrapper around superagent-promise
 */

// TODO write tests....
import Superagent from 'superagent';
import superagentPromise from 'superagent-promise';

// Note: MAKE SURE config is not included in client bundle
// should only be required for server code
import config from '../config';

let agent = superagentPromise(Superagent, Promise);

// not required/functional in browser
let jar;
if (Superagent.agent) {
  jar = new Superagent.agent();
}

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
  let agent = Agent.agent;

  let req = agent(method, toAbsoluteUrl(url), ...args);

  if (jar) {
    // manage cookies
    req.on('response', jar.saveCookies.bind(jar));
    req.on('redirect', jar.saveCookies.bind(jar));
    req.on('redirect', jar.attachCookies.bind(jar, req));
    jar.attachCookies(req);
  }

  let then = req.then;
  req.then = function () {
    return then.apply(req, Array.prototype.slice.call(arguments, 0));
  };
  req.catch = function (reject) {
    return then.call(req, res => res).catch(reject);
  };
  return req;
}
Object.keys(agent).forEach(key => {
  Agent[key] = function (url, ...args) {
    return this(key.toUpperCase(), toAbsoluteUrl(url), ...args);
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
