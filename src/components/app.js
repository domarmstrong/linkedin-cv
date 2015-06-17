"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 *
 * App container, if no children are passed in defaults to the CV view
 */

import React from 'react';
import { PageMenu } from './page_menu';
import request from '../request';
import CV from '../views/cv';

export default class App extends React.Component {

  static fetchProps (routerState) {
    return request.getCached('/api/app-name').then(res => ({ app_name: res.text }));
  }

  render () {
    let { app_name, routerState, children } = this.props;
    let active_route = routerState.location.pathname;

    return (
      <div id="app">
        <PageMenu app_name={ app_name } active_route={ active_route } />

        <div className="container">
          { children }
        </div>
      </div>
    )
  }
}
App.propTypes = {
  app_name: React.PropTypes.string.isRequired,
};
