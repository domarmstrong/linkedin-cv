"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export default class Page404 extends React.Component {
  render () {
    return (
      <div id="Page404" className="error-page">
        <h1>404</h1>
        <div className="sub">Sorry the requested page <em>{ this.props.url }</em> does not exist</div>
      </div>
    )
  }
}
