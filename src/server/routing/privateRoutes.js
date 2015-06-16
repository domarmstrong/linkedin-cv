"use strict";

/**
 * Author: Dom Armstrong, Date: 23/05/15
 */

import koaRouter from 'koa-router';
import linkedIn from '../linkedIn';

const privateRoutes = koaRouter();

privateRoutes.use(function *(next) {
  if (this.isAuthenticated()) {
    yield next;
  } else {
    this.redirect('/login');
  }
});

privateRoutes.get('/admin/update', function *(next) {
  yield linkedIn.updateProfile(this).then(record => {
    return this.body = JSON.stringify(record);
  }).catch(err => {
    if (err.message === linkedIn.AUTH_REQUIRED || err.status === 401) {
      // No auth found in database, redirect to linkedIn oauth
      linkedIn.requestUserAuth(this);
    } else {
      // rethrow error for outer handler
      throw err;
    }
  });
});

export default privateRoutes;
