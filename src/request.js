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
function toAbsoluteUrl (url) {
  // TODO make more robust pattern match?
  if (!process.browser && url[0] === '/') {
    return 'http://localhost:' + config.app_port + url;
  }
  return url;
}

function absolutePlugin (req) {
  req.url = toAbsoluteUrl(req.url);
}

/**
 * Export an agent with all methods extended to use absolute urls
 */
export default function Agent(method, url, ...args) {
  return agent(method, toAbsoluteUrl(url), ...args);
}
Object.keys(agent).forEach(key => {
  Agent[key] = function (url, ...args) {
    return agent[key](toAbsoluteUrl(url), ...args);
  };
});

let cache = {};

Object.assign(Agent, {
  /**
   * Make a get request and cache the results
   * further request with the same url and query params will return from cache
   * and not make a new request.
   * @param url
   */
  getCached (url) {
    //if (cache[url]) return Promise.resolve(cache[url]);
    let req = Agent('GET', toAbsoluteUrl(url));

    function getCacheKey(req) {
      return req.url + (JSON.stringify(req.qs || req._query) || '');
    }

    let end = req.end;
    req.end = function (...args) {
      throw new Error('Not implemented');
      return end(...args);
    };

    let then = req.then;
    req.then = function (resolve, reject) {
      let key = getCacheKey(this);
      if (key in cache) {
        return resolve(cache[key]);
      } else {
        return then.call(this, res => {
          // Cache the res
          cache[key] = res;
          return res;
        }, reject).then(resolve);
      }
    };

    return req;
  }
});
