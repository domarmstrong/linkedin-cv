"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import { db } from './db';
import crypto from 'crypto';

function sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}

export default {
    /**
     * Takes plaintext username and password and return bool if user in database
     *
     * @param username
     * @param password
     * @return (Boolean)
     */
    login (username, password) {
        return db.collection('users').findOne({
            username: username,
            password: sha1(password),
        }).then(user => !!user);
    },

    /**
     * Take plaintext username and password and returns the saved user object
     * throws various validation errors
     *
     * @param username
     * @param password
     * @return (Object) the new user record
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
    }
};
