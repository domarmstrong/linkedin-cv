"use strict";

/**
 * Author: Dom Armstrong, Date: 23/05/15
 */

import koaRouter from 'koa-router';
import linkedIn from './linkedIn';
import { render } from './renderer';

// Views
import Admin from '../views/admin';

const privateRoutes = koaRouter();

privateRoutes.use(function *(next) {
  if (this.isAuthenticated()) {
    yield next;
  } else {
    this.redirect('/login');
  }
});

privateRoutes.get('/admin', function *(next) {
  this.body = yield render( Admin, {}, { active_route: '/admin' } );
});

privateRoutes.get('/admin/update', function *(next) {
  yield linkedIn.updateProfile(this).then(record => {
    return this.body = JSON.stringify(record);
  }).catch(err => {
    if (err.message === linkedIn.AUTH_REQUIRED) {
      // No auth found in database, redirect to linkedIn oauth
      linkedIn.requestUserAuth(this);
    } else {
      // rethrow error for outer handler
      throw err;
    }
  });
});

export default privateRoutes;
