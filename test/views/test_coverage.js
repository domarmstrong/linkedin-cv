"use strict";

import { assert } from 'chai';
import TestCoverage from '../../src/views/test_coverage';
import React from 'react';
import test_utils from '../test_utils';
import sinon from 'sinon';

// helper
function clickLink (link) {
  var event = link.ownerDocument.createEvent("HTMLEvents");
  event.initEvent("click", true, true);
  link.dispatchEvent(event);
}

describe('Test Coverage page', () => {
  it('renders with no errors', () => {
    return test_utils.renderWithRouter(TestCoverage);
  });

  describe('hijackLinks', () => {
    let router;

    beforeEach(() => {
      router = { transitionTo: sinon.stub() };
    });

    it('makes local links redirect with react-router transitionTo', () => {
      let testContent = `<body><a href="/foo">bar</a></body>`;
      return test_utils.renderWithRouter(TestCoverage, { testContent }, { router }).then(comp => {
        let doc = React.findDOMNode(comp.refs.frame).contentDocument;
        let a = doc.querySelector('a');
        clickLink(a);
        assert.equal(router.transitionTo.args[0][0], '/foo');
      });
    });

    it('does not hijacks links absolute urls', () => {
      let testContent = `<body><a href="http://google.com">bar</a></body>`;
      return test_utils.renderWithRouter(TestCoverage, { testContent }, { router }).then(comp => {
        let doc = React.findDOMNode(comp.refs.frame).contentDocument;
        let a = doc.querySelector('a');
        clickLink(a);
        assert(router.transitionTo.notCalled, 'transitionTo should not be called');
      });
    });

    it('redirects base/path/index.html > base/path', () => {
      let routerState = {
        location: { pathname: 'base/path/foo.html' },
        params: { splat: 'foo.html' }
      };
      let testContent = `<body><a href="/index.html">bar</a></body>`;
      return test_utils.renderWithRouter(TestCoverage, { testContent, routerState }, { router }).then(comp => {
        let doc = React.findDOMNode(comp.refs.frame).contentDocument;
        let a = doc.querySelector('a');
        clickLink(a);
        assert.equal(router.transitionTo.args[0][0], 'base/path');
      });
    });
  });

  describe('getBasePath', () => {
    it('trims the splat', () => {
      let routerState = {
        location: { pathname: 'foo/bar/baz/qux.html' },
        params: { splat: 'baz/qux.html' }
      };
      return test_utils.renderWithRouter(TestCoverage, { routerState }).then(comp => {
        assert.equal(comp.getBasePath(), 'foo/bar/');
      });
    });

    it('ensures a trailing slash', () => {
      let routerState = {
        location: { pathname: 'foo/bar' },
        params: { splat: null }
      };
      return test_utils.renderWithRouter(TestCoverage, { routerState }).then(comp => {
        assert.equal(comp.getBasePath(), 'foo/bar/');
      });
    });
  });

  describe('getPath', () => {
    it('works with an string splat', () => {
      let routerState = {
        params: { splat: 'foo/bar/baz.html' }
      };
      return test_utils.renderWithRouter(TestCoverage, { routerState }).then(comp => {
        assert.equal(comp.getPath(), 'foo/bar/baz.html');
      });
    });

    it('works with an array splat', () => {
      let routerState = {
        params: { splat: ['foo', 'bar', 'baz.html'] }
      };
      return test_utils.renderWithRouter(TestCoverage, { routerState }).then(comp => {
        assert.equal(comp.getPath(), 'foo/bar/baz.html');
      });
    });

    it('removes leading slash', () => {
      let routerState = {
        params: { splat: '/foo/bar/baz.html' }
      };
      return test_utils.renderWithRouter(TestCoverage, { routerState }).then(comp => {
        assert.equal(comp.getPath(), 'foo/bar/baz.html');
      });
    });
  });
});
