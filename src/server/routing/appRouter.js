"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * Use react router to serve the application views
 *
 */

import Router from 'react-router';
import routes, { fetchHandlerData } from '../../app-routes';
import { render } from '../renderer';
import config from '../../../config';
import queryString from 'query-string';
import auth from '../../interfaces/auth';

/**
 * Use react router to serve app pages statically
 */
export default {
  middleware () {
    return function *(next) {
      this.body = yield handleRoute(this, this.req.url);
    }
  }
}

function createAuth(req) {
  /**
   * @implements auth
   */
  return {
    isAuthenticated () {
      return req.isAuthenticated();
    }
  }
}

/**
 * Get the context to pass to `willTransitionTo` as transition.context
 * Note: this is not the same as a components this.context.
 * @param req
 * @returns {Object}
 */
function getTransitionContext(req) {
  return {
    auth: createAuth(req)
  }
}

function handleRoute (req, url) {
  return new Promise((resolve, reject) => {
    let router = Router.create({
      location: url,
      routes: routes,
      transitionContext: getTransitionContext(req),
      onError: err => reject(err),
      onAbort: info => reject(info) // caught below as 'Redirect'
    });
    router.run((Handler, state) => {
      resolve(renderHandler(Handler, state))
    });
  }).catch(err => {
    if (err.constructor.name === 'Redirect') {
      let query = queryString.stringify(err.query);
      let path = [ err.to ];
      if (query) path.push(query);
      path = path.join('?');
      req.redirect(path);
      return handleRoute(path);
    }
    throw err;
  });
}

function renderHandler (Handler, state) {
  return fetchHandlerData(state).then(routeData => {
    // context.routeData will be available to all components
    let context = { routeData };
    // Props for top level app component
    let props = { app_name: config.app_name };
    return render(Handler, props, context);
  })
}
