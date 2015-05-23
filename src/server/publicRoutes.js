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

// Views
import { CV } from '../views/cv.jsx';
import { Login } from '../views/login.jsx';
import { Code } from '../views/code.jsx';

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
  this.body = yield code.getPublicTree().then(tree => {
    return render( Code, { fileTree: tree }, { active_route: '/the-code' } );
  });
});

publicRoutes.get('/the-code/:fileId', function *(next) {
  this.body = yield Q.all([
    code.getPublicTree(),
    code.renderFile(this.params.fileId)
  ]).then(data => {
    let [ tree, file ] = data;
    return render( Code, { code: file, fileTree: tree }, { active_route: '/the-code' } );
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
