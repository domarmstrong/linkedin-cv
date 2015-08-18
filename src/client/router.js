"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import { Router } from 'react-router';
import Location from 'react-router/lib/Location';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import routes, { fetchProps, isAllowed } from '../app_routes';
import queryString from 'querystring';
import { getClient } from './client';
import ReactDOM from 'react-dom';

let client = getClient();

/** @Map */
let routeData;

/**
 * Is this transition to the new page allowed?
 * Before transition fetchProps async for components
 *
 * @param nextState
 * @param transition
 * @param cb
 */
function onTransition(nextState, transition, cb) {
  let router = this;
  isAllowed(client, nextState)
    .then(allowed => {
      if (! allowed) {
        transition.isCancelled = true;
        transition.redirectInfo = {
          pathname: '/login',
          query: { next: encodeURIComponent(nextState.location.pathname) },
        };
        return cb();
      }
      return fetchProps(nextState).then(_routeData => routeData = _routeData)
        .then(() => cb());

    }).catch(err => {
      console.log(err); // TODO error logging
      cb(err);
    });
}

// Create route components passing in data from fetchProps
function createElement(Component, state) {
  let props = routeData.get(Component);
  return <Component {...props} routerState={ state }>{ state.children }</Component>;
}

let router = {
  /**
   * Initialize the router
   * @param location {Location} (optional) react-router location
   * @param history {History} (optional) react-router history
   * @param appRoutes {XML, Route} (optional) react-router Route component
   * @returns {Promise}
   */
  init (location=null, history=null, appRoutes=routes) {
    if (! location) {
      let query = queryString.parse(window.location.search.replace('?',''));
      location = new Location(window.location.pathname, query);
    }
    if (! history) {
      history = new BrowserHistory();
    }

    return new Promise((resolve, reject) => {
      Router.run(appRoutes, location, [onTransition], (err, initialState, transition) => {
        if (err) return reject(err);

        let router = ReactDOM.render(
          <Router { ...initialState } routes={ appRoutes } history={ history } createElement={ createElement } />,
          document.querySelector('#_mount')
        );
        router.addTransitionHook(onTransition);
        resolve(router);
      });
    });
  }
};

export default router;
