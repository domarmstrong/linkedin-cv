"use strict";

import { assert } from 'chai';
import { Breadcrumb } from '../../src/components/breadcrumb';
import test_utils from '../test_utils';

describe('Breadcrumb', () => {
  describe('renders with no errors', () => {
    test_utils.renderWithRouter(Breadcrumb, { url: '/foo/bar/baz' });
  });

  describe('getUrlParts', () => {
    it('splits the url into parts', () => {
      assert.deepEqual(Breadcrumb.getUrlParts('/foo/bar/baz'), [
        { url: '/foo', name: 'foo' },
        { url: '/foo/bar', name: 'bar' },
        { url: '/foo/bar/baz', name: 'baz' },
      ]);
    });

    it('splits the url into parts', () => {
      assert.deepEqual(Breadcrumb.getUrlParts('/'), []);
    });
  });
});
