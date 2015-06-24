"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * Use react router to serve the application views
 *
 */

import { Router } from 'react-router';
import Location from 'react-router/lib/Location';
import routes, { fetchProps } from '../../app_routes';
import { render } from '../renderer';
import config from '../../../config';
import queryString from 'querystring';
import auth from '../../interfaces/auth';

/**
 * Use react router to serve app pages statically
 */
export default {
  middleware () {
    return function *(next) {
      this.body = yield handleRoute(this);
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
// TODO not used
function getTransitionContext(req) {
  return {
    auth: createAuth(req)
  }
}

function handleRoute (ctx, location) {
  if (! location) {
    location = new Location(ctx.path, ctx.query);
  }

  return new Promise((resolve, reject) => {
    // Run the router to work out what to render
    Router.run(routes, location, (err, initialState, transition) => {
      if (err) return reject(err);
      resolve([initialState, transition]);
    })
  }).then(([initialState, transition]) => {
    // Fetch data from any fetchProps methods on the componnents
    return fetchProps(initialState).then(routeData => {

      // Pass the props in from the Components fetchProps method
      function createElement(Component, state) {
        if (state.route.loginRequired && ! ctx.isAuthenticated()) {
          let err = new Error('Login required');
          err.redirect = '/login';
          err.location = location;
          throw err;
        }
        let props = routeData.get(Component);
        return <Component {...props} routerState={ state }>{ state.children }</Component>;
      }

      // Render the router
      return render(<Router { ...initialState } createElement={ createElement } />);
    });
  }).catch(err => {
    // If the error is a redirect, do a server redirect and restart the process
    if (err.redirect) {
      console.log('err redirect');
      let query = queryString.stringify({ then: err.location.pathname });
      let path = [ err.redirect ];
      if (query) path.push(query);
      path = path.join('?');
      ctx.redirect(path);
      ctx.req.url = path;
      return handleRoute(ctx);
    }
    throw err;
  });
}
