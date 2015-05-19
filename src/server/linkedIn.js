"use strict";

import mongodb from 'promised-mongo';
import request from 'request-promise';
import requestOrig from 'request';
import queryString from 'query-string';
import uuid from 'node-uuid';
import debug from 'debug';
import Qfs from 'q-io/fs';
import fs from 'fs';
import Q from 'q';
import path from 'path';

const d = debug('linkedIn-cv:auth');

/**
 * Manage authentication with linkedIn oauth see https://developer.linkedin.com/docs/oauth2
 */
export default {
    URN: uuid.v4(), // Unique value used to test for CSRF attacks
    authRequestUrl: 'https://www.linkedin.com/uas/oauth2/authorization',
    tokenRequestUrl: 'https://www.linkedin.com/uas/oauth2/accessToken',

    get _app () {
        return require('./index').app;
    },

    /**
     * Shortcuts to get app.config.linkedIn.*
     */
    get username () {
        return this._app.config.linkedIn.username;
    },
    get password () {
        return this._app.config.linkedIn.password;
    },
    get clientId () {
        return this._app.config.linkedIn.clientId;
    },
    get clientSecret () {
        return this._app.config.linkedIn.clientSecret;
    },
    get redirectUrl () {
        return this._app.config.linkedIn.redirectUrl;
    },

    /**
     * Get mongo connection on first access
     */
    get db () {
        if (! this._db) {
            let dbconf = this._app.config.mongodb;
            let conString = dbconf.connectionString;
            let dbName = dbconf.dbName;
            // Cant use path.join as it messes up double '//' in connection string
            if (! conString.endsWith('/')) {
                conString += '/';
            }
            if (dbName.startsWith('/')) {
                dbName = dbName.slice(1);
            }
            this._db = mongodb(conString + dbName);
        }
        return this._db;
    },

    /**
     * Request auth from linkedIn
     * @param req {Object} Koa request object}
     */
    requestUserAuth (req) {
        let query = queryString.stringify({
            response_type: 'code',
            redirect_uri: this.redirectUrl,
            client_id: this.clientId,
            state: this.URN,
        });
        let authUrl = `${ this.authRequestUrl }?${ query }`;
        d('Requesting auth');
        req.redirect(authUrl);
    },

    /**
     * Handle the response from linkedIn
     * @param req {Object} Koa request object}
     * @param params {Object} { state {URN}, code {String} } || { error {String}, error_description {String} }
     */
    handleAuthResponse (req, params) {
        d('Auth response', params);

        // If the state does not match the URN throw 401 error or access was denied by user/linkedIn
        if (params.state !== this.URN) {
            d('Error: state does not match URN');
            req.throw(401);
        }
        // If an error occurred, log the error and deal with the error type
        else if (params.error) {
            // TODO: error logging
            d('Error: auth denied by user/linkedIn', params);
            if (params.error === 'access_denied') {
                req.throw(401);
            } else {
                req.throw(502);
            }
        }
        // If request was successful deal with the response
        else if (params.code) {
            d('Received code', params.code);
            let postData = {
                grant_type: 'authorization_code',
                code: params.code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUrl,
            };
            request.post({
                url: this.tokenRequestUrl,
                form: postData
            }).then(body => {
                let auth = JSON.parse(body);
                d('Access token granted', auth);
                return this.setAuth(auth);
            }).then(auth => {
                d('Auth token saved');
                req.redirect('/');
            }).catch(err => {
                // TODO: error logging
                console.error(err);
                req.throw(501);
            }).done();
        }
    },

    /**
     * Cache the linkedIn auth data, avoid needless db look-ups
     */
    auth: {
        access_token: null,
        expires_in: null,
    },

    /**
     * Get the auth token from the database if present else request auth
     * @return (Promise) { access_token, expires_in }
     */
    getAuth (req) {
        if (this.auth.access_token) {
            // Return cached value if present wrap in a promise
            return Q(this.auth);
        }
        return this.db.collection('auth')
            .findOne({ username: this.username })
            .then(auth => {
                if (auth) {
                    // Cache look-up
                    this.auth = auth;
                    return auth;
                }
                // No auth found, request user auth
                return this.requestUserAuth(req);
            });
    },

    /**
     * Save auth token to the database
     * @return (Promise)
     */
    setAuth (access) {
        // Update the cached auth data
        this.auth = access;
        let authCollection = this.db.collection('auth');
        let update = {
            username: this.username,
            access_token: auth.access_token,
            expires_in: auth.expires_in,
        };
        return authCollection.update({ username: this.username }, update, { upsert: true });
    },

    apiGet (req, url) {
        return this.getAuth(req).then(auth => {
            return {
                auth: {
                    bearer: auth.access_token,
                },
                headers: {
                    'x-li-format': 'json',
                }
            };
        }).then(options => {
            return request.get(url, options).then(response => {
                return JSON.parse(response);
            }).catch(err => {
                console.error('Auth error: ', err);
            });
        });
    },

    /**
     * Get users profile
     * @return (Promise)
     */
    updateProfile (req) {
        let fields = [
            'id',
            'first-name',
            'last-name',
            'summary',
            'specialties',
            'positions',
            'skills',
            'picture-urls::(original)'
        ];
        let person;
        return this.apiGet(req, `https://api.linkedin.com/v1/people/~:(${ fields.join(',') })`).then(_person => {
            person = _person;
        }).then(() => {
            let pictureUrl = person.pictureUrls.values[0];
            if (! pictureUrl) throw new Error('pictureUrl not received');
            return this.saveProfileImage(person.id, pictureUrl);
        }).then(imagePath => {
            let record = {
                id: person.id,
                firstName: person.firstName,
                lastName: person.lastName,
                summary: person.summary,
                specialties: person.specialties,
                skills: person.skills || [],
                positions: person.positions || [],
                imagePath: imagePath,
            };
            return this.db.collection('people')
                .update({ id: person.id }, record, { upsert: true })
                .then(() => record);
        });
    },

    saveProfileImage (id, url) {
        let filePath = `/public/profilePics/${ id }.jpg`;
        let fullPath = path.join(process.cwd(), filePath);
        return request(url, { encoding: 'binary' }).then(function(image) {
            return Qfs.write(fullPath, new Buffer(image, 'binary'));
        }).then(() => filePath);
    },

    getProfile () {
        return this.db.collection('people').findOne();
    },
};

