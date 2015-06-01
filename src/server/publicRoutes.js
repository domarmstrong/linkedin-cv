"use strict";

/**
 * Author: Dom Armstrong, Date: 23/05/15
 */

import koaRouter from 'koa-router';
import passport from 'koa-passport';
import queryString from 'query-string';
import linkedIn from './linkedIn';
import Q from 'q';
import debug from 'debug';
import { render } from './renderer';
import code from './code';
import test from './test';

// Views
import CV from '../views/cv';
import Login from '../views/login';
import Code from '../views/code';
import LookInside from '../views/look_inside';
import Tests from '../views/tests';
import TestCoverage from '../views/test_coverage';

const publicRoutes = koaRouter();
const d = debug('linkedIn-cv:server');

publicRoutes
  .get('/login', function *(next) {
    this.body = yield render( Login );
  })
  .post('/login', function *(next) {
    var ctx = this;
    let { username } = this.request.body;

    yield* passport.authenticate('local', function*(err, user, info) {
      if (err) throw err;

      if (user) {
        d('Login success: ', username);
        yield ctx.login(user);
        ctx.redirect('/admin');
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

publicRoutes.get('/', function *(next) {
  this.body = yield linkedIn.getProfile()
    .then(profile => render( CV, profile, { active_route: '/' } ));
});

publicRoutes.get('/the-code', function *(next) {
  this.body = yield render( LookInside, {}, { active_route: '/the-code' });
});

publicRoutes.get('/the-code/tests', function *(next) {
  this.body = yield test.jsonReport().then(data => {
    return data;//render( Tests, { data: data }, { active_route: '/the-code' })
  });
});

publicRoutes.get('/the-code/test-coverage', function *(next) {
  this.body = yield render( TestCoverage, {}, { active_route: '/the-code' });
});

publicRoutes.get('/the-code/:fileId', function *(next) {
  console.log('+++++ run');
  let fileId = this.params.fileId;
  this.body = yield Q.all([
    code.getPublicTree(),
    code.renderFile(fileId)
  ]).then(data => {
    let [ tree, file ] = data;
    return render( Code, { code: file, fileTree: tree, current_file: fileId }, { active_route: '/the-code' } );
  });
});

/**
 * Handle responses from linkedIn auth
 */
publicRoutes.get('/auth/linkedin/redirect', function *(next) {
  let params = queryString.parse(this.req._parsedUrl.query);
  yield linkedIn.handleAuthResponse(this, params);
});

export default publicRoutes;
