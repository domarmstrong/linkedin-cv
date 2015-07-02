"use strict";

import { assert } from 'chai';
import test_utils from '../../test_utils';
import publicRoutes from '../../../src/server/routing/publicRoutes';
import request from '../../../src/request';

before(() => {
  publicRoutes.get('/api/test', function *() {
    throw new Error('foo error');
  });
});

describe('routing', () => {
  before(() => {
    test_utils.startServer();
  });
  after(() => {
    test_utils.stopServer();
  });

  context('on unhandled error', () => {
    it('returns the error page', () => {
      return request.get('/api/test').then(() => assert.fail()).catch(err => {
        assert.match(err.response.text, /PageError/, 'PageError class');
        assert.match(err.response.text, /foo error/, 'error text included');
      });
    });
  });

  context('on not found', () => {
    it('returns the 404 page', () => {
      return request.get('/api/test_404').then(() => assert.fail()).catch(err => {
        assert.match(err.response.text, /Page404/, 'Page404 class');
      });
    });
  });
});
