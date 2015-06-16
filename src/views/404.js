"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export default class Page404 extends React.Component {
  render () {
    let currentPath = this.props.routerState.location.pathname;

    return (
      <div id="Page404" className="error-page">
        <h1>404</h1>
        <div className="sub">Sorry the requested page <em>{ currentPath }</em> does not exist</div>
      </div>
    )
  }
}
Page404.propTypes = {
  routerState: React.PropTypes.object.isRequired,
};

