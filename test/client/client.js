"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import Client from '../../src/client/client';
import router from '../../src/client/router';

describe('client', () => {
  let client;

  beforeEach(() => {
    sinon.stub(router, 'init').returns(Promise.resolve(router));
    client = new Client();
  });
  afterEach(() => {
    process.browser = false;
    router.init.restore();
  });

  describe('init', () => {
    it('initialises the router if process.browser', () => {
      process.browser = true;

      return client.init().then(() => {
        assert.equal(client.router, router);
      });
    });

    it('does not initialise the router if not process.browser', () => {
      process.browser = false;
      return client.init().then(() => {
        assert.equal(client.router, null);
      });
    });
  });

  it('creates a new socket the first time its accessed', () => {
    assert.equal(client._socket, null);
    let socket = client.socket;
    assert.notEqual(client._socket, null);
  });
});
