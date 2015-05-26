"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import classNames from 'classnames';
import { PageMenu } from './page_menu';

export class Layout extends React.Component {
  render () {
    let classnames = classNames('layout', this.props.className);

    return (
      <div id={ this.props.id } className={ classnames }>
        <PageMenu />

        <div className="container">
          { this.props.children }
        </div>
      </div>
    )
  }
}
