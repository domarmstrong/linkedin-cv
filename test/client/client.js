"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import Client from '../../src/client/client';
import router from '../../src/client/router';
import auth from '../../src/server/auth';
import request from '../../src/request';

describe('client', () => {
  let client;

  beforeEach(() => {
    sinon.stub(router, 'init').returns(Promise.resolve(router));
    client = new Client();
  });
  afterEach(() => {
    process.browser = false;
    router.init.restore();
    request.cookies = null;
    return client.logout();
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

  describe('auth', () => {
    before(() => {
      return auth.createUser('testUser', 'testPass');
    });
    after(() => {
      return auth.deleteUser('testUser');
    });

    describe('login', () => {
      it('throws an error on failure', () => {
        return client.login('foo', 'bar').then(() => {
          throw new Error(); // force catch
        }).catch(err => {
          assert.equal(err.message, 'Username or password incorrect');
        });
      });

      it('returns true on success', () => {
        return client.login('testUser', 'testPass').then(ok => {
          assert(ok, 'login should return true');
        });
      });
    });

    describe('logout', () => {
      it('logs the user out', () => {
        return client.login('testUser', 'testPass').then(() => {
          return client.logout().then(() => {
            return client.isAuthenticated().then(isAuth => {
              assert.notEqual(isAuth, true);
            });
          });
        });
      });
    });

    describe('isAuthenticated', () => {
      it('returns false if not logged in', () => {
        return client.isAuthenticated().then(isAuth => {
          assert.notEqual(isAuth, true);
        });
      });

      it('returns true if logged in', () => {
        return request.getCookies().then(() => {
          return client.login('testUser', 'testPass').then(ok => {
            return client.isAuthenticated().then(isAuth => {
              assert.equal(isAuth, true);
            });
          });
        });
      });

      context('multiple calls', () => {
        afterEach(() => {
          if (request.get.restore) request.get.restore();
        });

        it('subsequent calls will not be made if already checked until logged out', () => {
          return request.getCookies().then(() => {
            return client.login('testUser', 'testPass').then(ok => {
              return client.isAuthenticated().then(isAuth => {
                assert.equal(isAuth, true);
              });
            }).then(() => {
              sinon.stub(request, 'get');
              return client.isAuthenticated().then(isAuth => {
                assert.equal(isAuth, true);
                assert.equal(request.get.called, false);
              })
            });
          });
        })
      })
    })
  });
});
