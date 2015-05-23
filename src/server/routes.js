"use strict";

import privateRoutes from './privateRoutes';
import publicRoutes from './publicRoutes';
import { render } from './renderer';

// Views
import { Page404 } from '../views/404';

/**
 * Use the koa-router
 * @example
 * // require('./routes')(app);
 * @param app: koa app
 */
export default function (app) {
  // Handle routing errors
  app.use(function *(next) {
    // Handle errors from actual routes
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      // TODO error page
      this.body = err.message;
      this.app.emit('error', err, this);
    }
    // Handle 404s etc
    if (this.response.status === 404) {
      // TODO 404 page
      this.body = yield render( Page404, { url: this.originalUrl } );
    }
  });

  // Public routes
  app.use(publicRoutes.middleware());

  // Private routes
  app.use(privateRoutes.middleware());
};
