"use strict";

/**
 * Author: Dom Armstrong, Date: 02/06/15
 */

import { Route, Redirect } from 'react-router';

// Views
import App from './views/app';
import CV from './views/cv';
import Login from './views/login';
import Code from './views/code';
import LookInside from './views/look_inside';
import Tests from './views/tests';
import TestCoverage from './views/test_coverage';
import Contact from './views/contact';
import Portfolio from './views/portfolio';
import Optimise from './views/portfolio/optimise';
import OptimiseWebsite from './views/portfolio/optimise_website';

import Page404 from './views/404';

// Private
import Admin from './views/admin';

// BLAH react router expects global react
global.React = require('react');

export default [
  <Redirect from="/" to="/cv" />,

  <Route key="root" component={ App }>
    <Route path="cv" indexRoute={{ component: CV }} />
    <Route path="the-code" indexRoute={{ component: LookInside }}>
      <Route path="files*" component={ Code } />
      <Route path="tests" component={ Tests } />
      <Route path="test-coverage" indexRoute={{ component: TestCoverage }}>
        <Route path="*" component={ TestCoverage } />
      </Route>
    </Route>
    <Route path="portfolio" indexRoute={{ component: Portfolio }}>
      <Route path="optimise" component={ Optimise } />
      <Route path="optimise-website" component={ OptimiseWebsite } />
    </Route>
    <Route path="contact*" component={ Contact } />
    <Route path="login*" component={ Login } />
    <Route path="admin*" component={ Admin } loginRequired={ true } />
  </Route>,

  process.browser && <Route key="404" path="*" component={ Page404 } />,
];

/**
 * Before a route is rendered all component components will be checked for a `fetchProps` static method
 *
 * @example:
 *
 * class Component {
 *   static fetchProps () {
 *     // mynamespace should be unique to this component, error will be thrown on name clash
 *     return APromiseFor > { myprop: data }
 *   }
 *
 *   render () {
 *     let { myprops } = this.props;
 *   }
 * }
 *
 * @returns {Promise, [Map]}
 */
export function fetchProps (state) {
  let routeData = new Map();

  try {
    return Promise.all(
      state.branch
        .filter(branch => branch.component && branch.component.fetchProps) // find which components have a fetchProps method
        .map(branch => Promise.resolve(branch.component.fetchProps(state)) // fetch the data, may be promise
            .then(data => routeData.set(branch.component, data)) // set the data against the Component
      )
    ).then(() => routeData);
  } catch (err) {
    // Catch any synchronous errors
    return Promise.reject(err);
  }
}

/**
 * Check routes permissions to see is "loginRequired=true"
 * If no checks or loginRequired and client.isAuthenticated returns true
 *
 * @param context {Object} client or request, must have isAuthenticated method
 * @param state
 * @returns {Promise, [Boolean]}
 */
export function isAllowed (context, state) {
  // Check to see if any of the branches require login
  if (state.branch.some(branch => branch.loginRequired)) {
    return Promise.resolve(context.isAuthenticated());
  } else {
    return Promise.resolve(true);
  }
}
