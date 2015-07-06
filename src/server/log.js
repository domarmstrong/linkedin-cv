"use strict";

/**
 * Author: Dom Armstrong, Date: 06/07/15
 */

import config from '../../config';
import debug from 'debug';

export let loggers = {};
function logger(name, logFn) {
  let namespace = config.log_prefix + ':' + name;
  if (! (namespace in loggers)) {
    loggers[namespace] = debug(namespace);
    if (logFn) {
      loggers[namespace].log = logFn;
    }
  }
  return loggers[namespace];
}

let log = logger('log');

Object.assign(log, {
  error: logger('error', console.error.bind(console)),
  fatal: logger('fatal', console.error.bind(console)),
  debug: logger('debug', console.info.bind(console)),
  named: function (name, ...args) {
    return logger(name)(...args);
  },
});

export default log;
