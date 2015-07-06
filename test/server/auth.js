"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import { render } from '../../src/server/renderer';
import auth from '../../src/server/auth';
import config from '../../config';

describe('auth', () => {
  describe('createUser', () => {
    afterEach(() => {
      return auth.deleteUser('foo').catch(err => {});
    });

    it('requires username', () => {
      assert.throws(auth.createUser.bind(null, 'foo'), 'Username and password are both required');
    });

    it('requires password', () => {
      assert.throws(auth.createUser.bind(null, null, 'bar'), 'Username and password are both required');
    });

    it('requires username and password', () => {
      assert.throws(auth.createUser, 'Username and password are both required');
    });

    it('requires username is a string', () => {
      assert.throws(auth.createUser.bind(null, {}, 'bar'), 'Username and password must be strings');
    });

    it('requires password is a string', () => {
      assert.throws(auth.createUser.bind(null, 'foo', []), 'Username and password must be strings');
    });

    it('requires passwords at least 8 characters', () => {
      assert.throws(auth.createUser.bind(null, 'foo', 'bar'), 'Password must be at least 8 characters');
    });

    it('accepts passwords at least 8 characters', () => {
      return auth.createUser('foo', 'barbazqux');
    });

    it('requires a unique username', () => {
       return auth.createUser('foo', 'barbazqux').then(() => {
         return auth.createUser('foo', 'barbazqux');
       }).then(() => assert.fail()).catch(err => {
         assert.equal(err.message, 'User foo already exists');
       })
    });
  })
});
