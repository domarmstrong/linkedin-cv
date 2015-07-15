"use strict";

import { assert } from 'chai';
import Code, { DirectoryView } from '../../src/views/code';
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
      dir: {
        'src': { type: 'folder', path: 'src/' },
        'test.js': { type: 'file', path: 'test.js' },
      },
    };
  });

  it('renders file with no errors', () => {
    let props = {
      file: '<pre>var code = true</pre>',
    };
    return test_utils.renderWithRouter(Code, props);
  });

  it('renders dir with no errors', () => {
    return test_utils.renderWithRouter(Code, props);
  });

  describe('getBackPath', () => {
    it('returns the path to the next link up', () => {
      let routerState = {
        location: { pathname: '/files/src/file.js' },
        params: { splat: 'src/file.js' }
      };
      assert.equal(Code.getBackPath(routerState), '/files/src');
    });
  });

  describe('fetchProps', () => {
    it('runs fetches a file', () => {
      let state = {
        params: { splat: '/README.md' },
      };
      return Code.fetchProps(state).then(data => {
        assert.typeOf(data, 'object');
        assert.typeOf(data.file, 'string');
      });
    });

    it('runs fetches a directory', () => {
      let state = {
        params: { splat: '/src' },
      };
      return Code.fetchProps(state).then(data => {
        assert.typeOf(data, 'object');
        assert.typeOf(data.dir, 'object');
      });
    });
  });

  describe('DirectoryView', () => {
    describe('getUrlPrefix', () => {
      it('returns the correct urlPrefix', () => {
        props.routerState = {
          location: { pathname: '/prefix/filename.test' },
          params: { splat: '/filename.test' }
        };
        return test_utils.renderWithRouter(DirectoryView, props).then(view => {
          assert.equal(view.getUrlPrefix(), '/prefix');
        });
      });
    });
  });
});
