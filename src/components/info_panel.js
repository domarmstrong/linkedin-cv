"use strict";

/**
 * Author: Dom Armstrong, Date: 18/08/15
 */

import React from 'react';
import { Link } from 'react-router';

export class InfoPanel extends React.Component {
  render () {
    let { title, img, href, children } = this.props;
    return (
      <li className="info-panel">
        <Link className="page-link" to={ href }>
          <h2>{ title }</h2>
          <img src={ img } />
        </Link>

        <p>{ children }</p>
      </li>
    );
  }
}
InfoPanel.propTypes = {
  title: React.PropTypes.string.isRequired,
  img: React.PropTypes.string.isRequired,
  href: React.PropTypes.string.isRequired,
};
