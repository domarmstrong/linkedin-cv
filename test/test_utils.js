"use strict";

/**
 * Author: Dom Armstrong, Date: 18/06/15
 *
 * Test helper functions
 */

import { Router, Route } from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import path from 'path';

export default {
  /**
   * Render this component using react-router so that it has the expected context and props
   * This is required for some views that use the router `Link` component for example
   *
   * @property Component {React class}
   * @property props {Object}
   * @property done {Function} receives ref to rendered component
   */
  renderWithRouter (Component, props={}, context={}, url='/') {
    return new Promise((resolve, reject) => {
      // The router renders async so use a wrapper in order to run the done callback
      // and pass in a ref to the rendered component
      class Wrap extends React.Component {
        getChildContext () {
          return context;
        }
        componentDidMount () {
          resolve(this.refs.el);
        }
        render () {
          return <Component ref="el" routerState={ this.props } { ...props } />;
        }
      }
      Wrap.childContextTypes = { router: React.PropTypes.any };

      TestUtils.renderIntoDocument(
        <Router history={ new MemoryHistory([ url ]) } onError={ reject }>
          <Route path="*" component={ Wrap } />
        </Router>
      );
    });
  },

  server: null,

  startServer () {
    delete require.cache[path.join(process.cwd(), 'src/server/index.js')];
    this.server = require('../src/server').init();
  },

  stopServer () {
    this.server.close();
  }
}
