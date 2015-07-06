"use strict";

import { assert } from 'chai';
import test_utils from '../../test_utils';
import publicRoutes from '../../../src/server/routing/publicRoutes';
import request from '../../../src/request';
import Client from '../../../src/client/client';
import auth from '../../../src/server/auth';
import config from '../../../config';

let baseUrl = 'http://localhost:' + config.app_port;

describe.only('publicRoutes', () => {
  let client;

  before(async () => {
    test_utils.startServer();
    client = await new Client();
    await auth.createUser('testUser', 'testPass');
  });
  after(async () => {
    test_utils.stopServer();
    await auth.deleteUser('testUser');
  });

  describe('logout', () => {
    beforeEach(async () => {
      await client.login('testUser', 'testPass');
    });

    it('logs the user out', async () => {
      let res;
      res = await request.get('/auth/is-authenticated');
      assert.equal(res.body, true);

      await request.get('/logout');

      res = await request.get('/auth/is-authenticated');
      assert.equal(res.body, false);
    });

    it('redirects to /', async () => {
      let res = await request.get('/logout');
      assert.equal(res.redirects.length, 1);
      assert.equal(res.redirects[0], baseUrl + '/');
    });
  });

  describe('login', () => {
    context('request accepting html', () => {
      it('redirects to /admin on success', async () => {
        let res = await request.post('/auth/login')
          .accept('html')
          .send({ username: 'testUser', password: 'testPass' });

        assert.equal(res.redirects.length, 1);
        assert.equal(res.redirects[0], baseUrl + '/admin');
      });

      it('re-renders the login page with failure on bad login', async () => {
        let err;
        try {
          await request.post('/auth/login')
            .accept('html')
            .send({ username: 'foo', password: 'bar' });
        } catch (error) {
          err = error;
        }
        assert.equal(err.status, 401);
        assert.match(err.response.text, /login/);
        assert.match(err.response.text, /Username or password incorrect/);
      });
    });
  });
});
