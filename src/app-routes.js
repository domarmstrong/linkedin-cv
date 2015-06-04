"use strict";

/**
 * Author: Dom Armstrong, Date: 02/06/15
 */

import { Route, DefaultRoute, NotFoundRoute } from 'react-router';

// Views
import App from './components/app';
import CV from './views/cv';
import Login from './views/login';
import Code from './views/code';
import LookInside from './views/look_inside';
import Tests from './views/tests';
import TestCoverage from './views/test_coverage';
import Page404 from './views/404';

// Private
import Admin from './views/admin';

// BLAH react router expects global react
global.React = require('react');

export default (
  <Route name="app" path="/" handler={ App }>
    <DefaultRoute name="cv" handler={ CV } />
    <Route name="the-code">
      <DefaultRoute name="look-inside" handler={ LookInside } />
      <Route name="tests" handler={ Tests } />
      <Route name="test-coverage" handler={ TestCoverage } />
      <Route name="code" path=":file" handler={ Code } />
    </Route>
    <Route name="login" handler={ Login } />
    <Route name="admin" handler={ Admin } />
    <NotFoundRoute name="404" handler={ Page404 } />
  </Route>
);
