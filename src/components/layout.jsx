"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import { PageMenu } from './page_menu';

export class Layout extends React.Component {
  render () {
    return (
      <div id={ this.props.id } className="layout">
        <PageMenu />

        <div className="container">
          <div className="wrapper">
            { this.props.children }
          </div>
        </div>
      </div>
    )
  }
}
