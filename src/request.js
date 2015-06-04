"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * A wrapper around superagent-promise that rewrites urls to absolute paths
 * for the server which cannot operate with relative paths
 * it also calls end and return res.body
 *
 * Note: methods must be used as request.method('url') request('method', 'url') is not supported
 *
 * @example
 * ```
 * // before
 * request.get('localhost:8080/api/data').end().then(res => res.body);
 * // after
 * request.get('/api/data');
 * ```
 */

import superagentPromise from 'superagent-promise';
import Q from 'q';
import superagent from 'superagent';

// TODO MAKE SURE config is not included in client bundle
import config from '../config';

let request = superagentPromise(superagent, Q.Promise);

function wrap (fn) {
  return function (...args) {
    return fn.apply(request, args)
      .use(function (req) {
        if (process.browser) return req;
        // TODO make more robust pattern match?
        if (req.url[0] === '/') {
          req.url = 'localhost:' + config.app_port + req.url;
        }
      })
      .end()
      .then(res => res.body);
  }
}

let superDooperAgent = {};

Object.keys(request).forEach(key => superDooperAgent[key] = wrap(request[key]));

export default superDooperAgent;
