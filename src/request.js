"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * A wrapper around superagent-promise that rewrites urls to absolute paths
 * for the server which cannot operate with relative paths
 */

// TODO write tests....
import superagent from 'superagent';
import superagentPromise from 'superagent-promise';

// Note: MAKE SURE config is not included in client bundle
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
  req.url = Agent.toAbsoluteUrl(req.url);
}

export default function Agent(method, url, ...args) {
  return agent(method, toAbsoluteUrl(url), ...args);
}
Object.keys(agent).forEach(key => {
  Agent[key] = function (url, ...args) {
    return agent[key](toAbsoluteUrl(url), ...args);
  };
});
