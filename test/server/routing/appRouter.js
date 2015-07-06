"use strict";

import { assert } from 'chai';
import test_utils from '../../test_utils';
import auth from '../../../src/server/auth';
import request from '../../../src/request';
import Client from '../../../src/client/client';

describe('appRouter', () => {

  before(async () => {
    test_utils.startServer();
    client = await new Client();
    await auth.createUser('testUser', 'testPass');
  });
  after(async () => {
    test_utils.stopServer();
    await auth.deleteUser('testUser');
  });

  describe('request page that requires login', () => {
    it('redirects to login if not authorized with querystring "then" for page requested', async () => {
      let res = await request.get('/admin');
      assert.equal(res.redirects.length, 1);
      assert.match(res.redirects[0], /\/login\?then=%2Fadmin/);
    });

    it('does not redirect if authorized', async () => {
      await client.login('testUser', 'testPass');

      let res = await request.get('/admin');
      assert.equal(res.redirects.length, 0);
      assert.equal(res.status, 200);
    });
  });
});
