"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import { RouteHandler } from 'react-router';
import { PageMenu } from './page_menu';
import request from '../request';

export default class App extends React.Component {

  static fetchData (routerState) {
    return {};
  }

  render () {
    let { app_name } = this.props;
    let active_route = this.context.router.getCurrentPath();

    return (
      <div id="app">
        <PageMenu app_name={ app_name } active_route={ active_route } />

        <div className="container">
          <RouteHandler />
        </div>
      </div>
    )
  }
}
App.propTypes = {
  app_name: React.PropTypes.string.isRequired,
};
App.contextTypes = {
  router: React.PropTypes.any,
};
