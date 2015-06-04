"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * A wrapper around request-promise that rewrites urls to absolute paths
 * for the server which cannot operate with relative paths
 */

import request from 'request-promise';

// TODO MAKE SURE config is not included in client bundle
import config from '../config';

function relToAbsoluteUrl(url) {
  // relative paths are correct for the browser
  // TODO make more robust pattern match?
  if (!process.browser && url[0] === '/') {
    return 'http://localhost:' + config.app_port + url;
  }
  return url;
}

function wrapped (url, ...args) {
  return request(relToAbsoluteUrl(url), ...args);
}

Object.keys(request).forEach(key => {
  if (['get', 'head', 'post', 'put', 'patch', 'del'].indexOf(key) !== -1) {
    wrapped[key] = function (url, ...args) {
      return request[key](relToAbsoluteUrl(url), ...args);
    }
  } else {
    wrapped[key] = request[key]
  }
});

export default wrapped;
