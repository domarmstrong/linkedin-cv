"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 *
 * App container, if no children are passed in defaults to the CV view
 */

import React from 'react';
import { PageMenu } from './../components/page_menu';
import { Breadcrumb } from './../components/breadcrumb';
import request from '../request';
import CV from './cv';

export default class App extends React.Component {

  static fetchProps (routerState) {
    return request.getCached('/api/app-name').then(res => ({ app_name: res.text }));
  }

  render () {
    let { app_name, routerState, children } = this.props;
    let { router } = this.context;
    let active_route = routerState.location.pathname;
    let url = router.state.location.pathname;

    return (
      <div id="app">
        <PageMenu app_name={ app_name } active_route={ active_route } />

        <div className="container">
          <Breadcrumb url={ url } />

          <div className="content">
            { children }
          </div>
        </div>
      </div>
    )
  }
}
App.propTypes = {
  app_name: React.PropTypes.string.isRequired,
};
App.contextTypes = {
  router: React.PropTypes.any.isRequired,
};
