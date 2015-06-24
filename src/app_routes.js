"use strict";

/**
 * Author: Dom Armstrong, Date: 02/06/15
 */

import { Route } from 'react-router';

// Views
import App from './components/app';
import CV from './views/cv';
import Login from './views/login';
import Code from './views/code';
import LookInside from './views/look_inside';
import Tests from './views/tests';
import TestCoverage from './views/test_coverage';
import Contact from './views/contact';

import Page404 from './views/404';

// Private
import Admin from './views/admin';

// BLAH react router expects global react
global.React = require('react');

export default (
  <Route path="/" component={ App } indexRoute={{ component: CV }}>
    <Route path="the-code" indexRoute={{ component: LookInside }}>
      <Route path="files/:file" component={ Code } />
      <Route path="tests" component={ Tests } />
      <Route path="test-coverage" indexRoute={{ component: TestCoverage }}>
        <Route path="*" component={ TestCoverage } />
      </Route>
    </Route>
    <Route path="contact*" component={ Contact } />
    <Route path="login*" component={ Login } />
    <Route path="admin*" component={ Admin } loginRequired={ true } />
    <Route path="*" component={ Page404 } />
  </Route>
);

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
            .catch(err => {
              // TODO error logging
              // console.log(`Error->fetchProps for: "${branch.component.name}", ${err.stack}`);
              throw err;
            })
      )
    ).then(() => routeData);
  } catch (err) {
    // Catch any synchronous errors
    return Promise.reject(err);
  }
}
