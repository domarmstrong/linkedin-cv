"use strict";

import privateRoutes from './privateRoutes';
import publicRoutes from './publicRoutes';
import appRouter from './appRouter';
import { render } from './renderer';

// Views
import Page404 from '../views/404';
import PageError from '../views/error';

/**
 * Add routing
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
      this.body = yield render( PageError, { url: this.originalUrl, status: this.status, error: err.message } );
      this.app.emit('error', err, this);
    }

    if (this.status === 404) {
      this.body = yield render(Page404, {url: this.originalUrl});
    }
  });

  // Public routes
  app.use(publicRoutes.middleware());

  // Private routes
  app.use(privateRoutes.middleware());

  // React application router
  app.use(appRouter.middleware());
};
