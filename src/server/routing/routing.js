"use strict";

/**
 * Author: Dom Armstrong, Date: 23/05/15
 *
 * Set up for all routing
 */

import privateRoutes from './privateRoutes';
import publicRoutes from './publicRoutes';
import appRouter from './appRouter';
import serve from 'koa-static';
import mount from 'koa-mount';
import path from 'path';
import { render } from '../renderer';

// Views
import Page404 from '../../views/404';
import PageError from '../../views/error';

/**
 * Convert days to milliseconds
 * @param days {number}
 * @returns {number}
 */
function daysToMS(days) {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Add routing
 * @example
 * // require('./routes')(app);
 * @param app: koa app
 */
export default function (app) {
  // static. NOTE: in production use NGINX to serve static resources so these routes are never reached
  app.use(mount('/', serve(path.join(__dirname, '../../public/favicon'), { maxage: daysToMS(100) })));
  app.use(mount('/public', serve(path.join(__dirname, '../../public'), { maxage: daysToMS(5) })));
  app.use(mount('/public', serve(path.join(__dirname, '../../build'), { maxage: daysToMS(5) })));
  app.use(mount('/test-coverage', serve(path.join(__dirname, '../../build/coverage'), { maxage: daysToMS(1) })));

  // Handle routing errors
  app.use(function *(next) {
    // Handle errors from actual routes
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = render(<PageError url={ this.originalUrl } status={ this.status } error={ err.message } />);
      this.app.emit('error', err, this);
    }

    if (this.status === 404) {
      this.body = render(<Page404 routerState={{ location: { pathname: this.originalUrl }}} />);
    }
  });

  // Public routes
  app.use(publicRoutes.middleware());

  // Private routes
  app.use(privateRoutes.middleware());

  // React application router
  app.use(appRouter.middleware());
};
