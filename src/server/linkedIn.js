"use strict";

import request from '../request';
import queryString from 'query-string';
import uuid from 'node-uuid';
import Qfs from 'q-io/fs';
import path from 'path';
import { db } from './db';
import log from './log';

const config = require(path.join(process.cwd(), 'config.js'));

/**
 * Manage authentication with linkedIn oauth see https://developer.linkedin.com/docs/oauth2
 */
export default {
  URN: uuid.v4(), // Unique value used to test for CSRF attacks
  authRequestUrl: 'https://www.linkedin.com/uas/oauth2/authorization',
  tokenRequestUrl: 'https://www.linkedin.com/uas/oauth2/accessToken',
  AUTH_REQUIRED: 'LinkedIn auth required', // constant

  /**
   * Request auth from linkedIn
   * @param req {Object} Koa request object}
   */
  requestUserAuth (req) {
    let query = queryString.stringify({
      response_type: 'code',
      redirect_uri: config.linkedIn.redirectUrl,
      client_id: config.linkedIn.clientId,
      state: this.URN,
    });
    let authUrl = `${ this.authRequestUrl }?${ query }`;
    log.debug('Requesting auth');
    req.redirect(authUrl);
  },

  /**
   * Handle the response from linkedIn
   * @param req {Object} Koa request object}
   * @param params {Object} { state {URN}, code {String} } || { error {String}, error_description {String} }
   */
  handleAuthResponse (req, params) {
    log.debug('Auth response', params);

    // If the state does not match the URN throw 401 error or access was denied by user/linkedIn
    if (params.state !== this.URN) {
      log.error('Error: state does not match URN');
      req.throw(401);
    }
    // If an error occurred, log the error and deal with the error type
    else if (params.error) {
      log.error('Error: auth denied by user/linkedIn', params);
      if (params.error === 'access_denied') {
        req.throw(401);
      } else {
        req.throw(502);
      }
    }
    // If request was successful deal with the response
    else if (params.code) {
      log.debug('Received code', params.code);
      let postData = {
        grant_type: 'authorization_code',
        code: params.code,
        client_id: config.linkedIn.clientId,
        client_secret: config.linkedIn.clientSecret,
        redirect_uri: config.linkedIn.redirectUrl,
      };
      return request.post(this.tokenRequestUrl)
        .type('form')
        .send(postData)
        .then(req => {
          log.debug('Access token granted', req.body);
          return this.setAuth(req.body);
        }).then(auth => {
          log.debug('Auth token saved');
          req.redirect('/admin/update');
        }).catch(err => {
          log.error(err);
          req.throw(501);
        });
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
  getAuth () {
    if (this.auth.access_token) {
      // Return cached value if present wrap in a promise
      return Promise.resolve(this.auth);
    }
    return db.collection('linkedIn-auth')
      .findOne({ username: config.linkedIn.username })
      .then(auth => {
        if (auth) {
          // Cache look-up
          this.auth = auth;
          return auth;
        }
        // User auth is via remote service and cannot be controlled
        // Throw to break out promise
        throw new Error(this.AUTH_REQUIRED);
      });
  },

  /**
   * Save auth token to the database
   * @return (Promise)
   */
  setAuth (access) {
    // Update the cached auth data
    this.auth = access;
    let authCollection = db.collection('linkedIn-auth');
    let update = {
      username: config.linkedIn.username,
      access_token: this.auth.access_token,
      expires_in: this.auth.expires_in,
    };
    return authCollection.update({ username: config.linkedIn.username }, update, { upsert: true });
  },

  apiGet (url) {
    return this.getAuth().then(auth => {
      return request.get(url)
        .set('x-li-format', 'json')
        .set('Authorization', 'Bearer ' + auth.access_token);
      }).catch(err => {
        log.error('Auth error: ', err.status);
        throw err;
      });
  },

  /**
   * Delete the users profile by id
   * @return {Promise}
   */
  deleteProfile (id) {
    return db.collection('people').remove({ id });
  },

  /**
   * Get users profile
   * @return (Promise)
   */
  updateProfile () {
    let fields = [
      'id',
      'first-name',
      'last-name',
      'location',
      'industry',
      'headline',
      'summary',
      'specialties',
      'positions',
      'skills',
      'educations',
      'public-profile-url',
      'picture-urls::(original)'
    ];
    let person;
    return this.apiGet(`https://api.linkedin.com/v1/people/~:(${ fields.join(',') })`).then(res => {
      person = res.body;
    }).then(() => {
      let pictureUrl = person.pictureUrls.values[0];
      if (! pictureUrl) throw new Error('pictureUrl not received');
      return this.saveProfileImage(person.id, pictureUrl);
    }).then(imagePath => {
      let record = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        location: person.location.name,
        industry: person.industry,
        headline: person.headline,
        summary: person.summary,
        specialties: person.specialties,
        skills: person.skills ? person.skills.values : [],
        positions: person.positions ? person.positions.values : [],
        educations: person.educations ? person.educations.values : [],
        publicProfileUrl: person.publicProfileUrl,
        imagePath: imagePath,
      };
      return db.collection('people')
        .update({ id: person.id }, record, { upsert: true })
        .then(() => record);
    });
  },

  saveProfileImage (id, url) {
    let filePath = `/public/profilePics/${ id }.jpg`;
    let fullPath = path.join(__dirname, '../../', filePath);
    return request.get(url).type('binary').then(function(res) {
      return Qfs.write(fullPath, res.body);
    }).then(() => filePath);
  },

  getProfile () {
    return db.collection('people').findOne().then(profile => {
      if (profile) {
        return profile;
      } else {
        // Test data in case no record in DB
        return {
          firstName: 'firstname',
          lastName: 'lastname',
          headline: 'headline',
          location: 'location',
          industry: 'industry',
          email: 'email',
          publicProfile: 'Public profile',
          summary: 'summary',
          specialties: 'specialties',
          positions: [],
          skills: [],
          educations: [],
        }
      }
    });
  },
};

