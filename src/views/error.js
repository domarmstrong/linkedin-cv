"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export default class PageError extends React.Component {
  render () {
    let support = 'dom@dom-armstrong.co.uk';

    return (
      <div id="PageError" className="error-page">
        <h1>{ this.props.status }</h1>
        <div className="sub">Woops. Something seems to have gone wrong</div>
        <p>If the problem persists please report it to <a href={ "mailto:" + support }>{ support }</a></p>
        <div className="error">
          <pre>Error: { this.props.error }</pre>
        </div>
      </div>
    );
  }
}
PageError.propTypes = {
  status: React.PropTypes.number.isRequired,
  error: React.PropTypes.string.isRequired,
};
