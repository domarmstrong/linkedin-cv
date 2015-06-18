"use strict";

import { assert } from 'chai';
import Code from '../../src/views/code';
import React from 'react';
import TestUtils from 'react/addons/TestUtils';
import test_utils from '../test_utils';

describe('Code view page', () => {
  let props;

  beforeEach(() => {
    props = {
      tree: {},
      code: '<pre>var code = true</pre>',
    };
    test_utils.createDOM();
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
});
