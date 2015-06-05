"use strict";

/**
 * Author: Dom Armstrong, Date: 23/05/15
 */

import koaRouter from 'koa-router';
import passport from 'koa-passport';
import queryString from 'query-string';
import linkedIn from '../linkedIn';
import debug from 'debug';
import { render } from '../renderer';
import code from '../code';
import test from '../test';

const publicRoutes = koaRouter();
const d = debug('linkedIn-cv:server');

let defaultLoginPath = '/admin';
publicRoutes.post('/login', function *(next) {
  var ctx = this;
  let { username } = this.request.body;
  let query = queryString.parse(this.req.url.split('?')[1]);

  yield* passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;

    if (user) {
      d('Login success: ', username);
      yield ctx.login(user);
      ctx.redirect(query.next || defaultLoginPath);
    } else {
      d('Login failed: ', username, info.message);
      ctx.status = 401;
      let props = { username: username, validation: {login: info.message} };
      yield render( Login, props ).then(rendered => ctx.body = rendered);
    }
  }).call(this, next);
});

publicRoutes.get('/logout', function *(next) {
  this.logout();
  this.redirect('/');
});

publicRoutes.get('/api/profile', function *() {
  this.body = yield linkedIn.getProfile();
});

publicRoutes.get('/api/code/:fileId', function *(next) {
  this.body = yield code.renderFile(this.params.fileId);
});

publicRoutes.get('/api/code-tree', function *() {
  this.body = yield code.getPublicTree();
});

publicRoutes.get('/api/test-results', function *() {
  this.body = yield test.getLastResult().then(data => data.streamData);
});

/**
 * Handle responses from linkedIn auth
 */
publicRoutes.get('/auth/linkedin/redirect', function *(next) {
  let params = queryString.parse(this.req._parsedUrl.query);
  debug('LinkedIn auth response', params);
  yield linkedIn.handleAuthResponse(this, params);
});

export default publicRoutes;
