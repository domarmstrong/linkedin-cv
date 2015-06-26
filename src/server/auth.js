"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import { db } from './db';
import crypto from 'crypto';

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}

let auth = {
  /**
   * Takes plaintext username and password and return the user object
   *
   * @param username
   * @param password
   * @return {Boolean}
   */
  getUser (username, password) {
    return db.collection('users').findOne({
      username: username,
      password: sha1(password),
    });
  },

  /**
   * Take plaintext username and password and returns the saved user object
   * throws various validation errors
   *
   * @param username
   * @param password
   * @return {Promise, [Object]} the new user record
   */
  createUser (username, password) {
    if (! (username || password)) {
      throw new Error('Username and password are both required');
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Username and password must be strings');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    let users = db.collection('users');
    return users.findOne({ username }).then(existing => {
      if (existing) throw new Error('User ' + username + ' already exists');
    }).then(() => {
      return users.insert({
        username: username,
        password: sha1(password),
      });
    });
  },

  /**
   * Delete a user by username
   *
   * @param username
   * @return {Promise}
   */
  deleteUser (username) {
    let users = db.collection('users');
    return users.findOne({ username }).then(existing => {
      if (! existing) throw new Error('User ' + username + ' does not exist');
    }).then(() => {
      return users.remove({ username });
    });
  }
};

export default auth;

/**
 * Passport serializeUser function
 * @param user
 * @param done
 */
export function passportSerialize (user, done) {
  done(null, user._id);
}

/**
 * Passport deserializeUser function
 * @param id
 * @param done
 */
export function passportDeserialize (id, done) {
  db.collection('users')
    .findOne({ _id: id })
    .then(user => done(null, user))
    .catch(err => done(err));
}

/**
 * Strategy for use with passport
 * @example
 * ```
 * passport.use(new LocalStrategy(auth.passportStrategy));
 * ```
 */
export function passportStrategy (username, password, done) {
  auth.getUser(username, password).then(user => {
    if (user) {
      done(null, user);
    } else {
      done(null, false, { message: 'Username or password incorrect' });
    }
  })
  .catch(done);
}
