"use strict";

import { assert } from 'chai';
import Code from '../../src/views/code';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import test_utils from '../test_utils';

describe('Code view page', () => {
  let props;
  before(() => {
    test_utils.startServer();
  });
  after(() => {
    test_utils.stopServer();
  });

  beforeEach(() => {
    props = {
      tree: {},
      code: '<pre>var code = true</pre>',
    };
  });

  it('renders with no errors', () => {
    return test_utils.renderWithRouter(Code, props);
  });

  describe('getUrlPrefix', () => {
    it('returns the correct urlPrefix', () => {
      props.routerState = {
        location: { pathname: '/prefix/filename.test' },
        params: { file: 'filename.test' }
      };
      return test_utils.renderWithRouter(Code, props).then(view => {
        assert.equal(view.getUrlPrefix(), '/prefix');
      });
    });
  });

  describe('fetchProps', () => {
    it('runs without error', () => {
      let state = {
        params: { file: 'README.md' },
      };
      return Code.fetchProps(state).then(data => {
        assert.typeOf(data, 'object');
        assert.typeOf(data.tree, 'object');
        assert.typeOf(data.code, 'string');
      });
    });
  });
});
