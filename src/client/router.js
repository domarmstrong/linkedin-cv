"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import { Router } from 'react-router';
import Location from 'react-router/lib/Location';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import routes, { fetchProps } from '../app_routes';
import queryString from 'querystring';

/** @Map */
let routeData;

// On transition fetchProps async for components
function onTransition(nextState, transition, cb) {
  fetchProps(nextState).then(_routeData => {
    routeData = _routeData;
    cb();
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

export default {
  init () {
    console.info('Initialize router');

    let query = queryString.parse(window.location.search.replace('?',''));
    let location = new Location(window.location.pathname, query);
    let history = new BrowserHistory();

    Router.run(routes, location, [onTransition], (err, initialState, transition) => {
      if (err) throw err; // TODO error logging

      let router = React.render(
        <Router { ...initialState } routes={ routes } history={ history } createElement={ createElement } />,
        document.querySelector('#_mount')
      );
      router.addTransitionHook(onTransition);
    });
  }
}

