"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import { render } from '../../src/server/renderer';
import log, { loggers } from '../../src/server/log';
import config from '../../config';

let prefix = config.log_prefix;

describe('log', () => {
  it('is a function', () => {
    log('my log');
  });

  describe('.named', () => {
    it('returns the same logger for the same name', () => {
      loggers[prefix + ':foo'] = sinon.stub();
      log.named('foo', 'bar');
      log.named('foo', 'bar');
      assert(loggers[prefix + ':foo'].calledTwice);
    });

    it('returns different loggers for the different names', () => {
      loggers[prefix + ':foo'] = sinon.stub();
      loggers[prefix + ':bar'] = sinon.stub();
      log.named('foo', 'baz');
      log.named('bar', 'baz');
      assert(loggers[prefix + ':foo'].calledOnce);
      assert(loggers[prefix + ':bar'].calledOnce);
    });
  })
});
