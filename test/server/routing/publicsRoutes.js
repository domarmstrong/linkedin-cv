"use strict";

import { assert } from 'chai';
import test_utils from '../../test_utils';
import publicRoutes from '../../../src/server/routing/publicRoutes';
import request from '../../../src/request';
import Client from '../../../src/client/client';
import auth from '../../../src/server/auth';
import config from '../../../config';

let baseUrl = 'http://localhost:' + config.app_port;

describe('publicRoutes', () => {
  let client;

  before(() => {
    test_utils.startServer();
    return auth.createUser('testUser', 'testPass');
  });
  after(() => {
    test_utils.stopServer();
    return auth.deleteUser('testUser');
  });

  beforeEach(() => {
    client = new Client();
  });

  describe('logout', () => {
    beforeEach(() => {
      return client.login('testUser', 'testPass');
    });

    it('logs the user out', () => {
      return request.get('/auth/is-authenticated').then(res => {
        assert.equal(res.body, true);
      }).then(() => {
        return request.get('/logout');
      }).then(() => {
        return request.get('/auth/is-authenticated');
      }).then(res => {
        assert.equal(res.body, false);
      });
    });

    it('redirects to /', () => {
      return request.get('/logout').then(res => {
        assert.equal(res.redirects.length, 1);
        assert.equal(res.redirects[0], baseUrl + '/');
      });
    });
  });

  describe('login', () => {
    context('request accepting html', () => {
      it('redirects to /admin on success', () => {
        return request.post('/auth/login')
          .accept('html')
          .send({ username: 'testUser', password: 'testPass' })
          .then(res => {
            console.log('redirects', res.redirects);
            assert.equal(res.redirects.length, 1);
            assert.equal(res.redirects[0], baseUrl + '/admin');
          });
      });

      it('re-renders the login page with failure on bad login', () => {
        return request.post('/auth/login')
          .accept('html')
          .send({ username: 'foo', password: 'bar' }).then(res => assert.fail()).catch(err => {
            assert.equal(err.status, 401);
            assert.match(err.response.text, /login/);
            assert.match(err.response.text, /Username or password incorrect/);
          });
      });
    });
  });
});
