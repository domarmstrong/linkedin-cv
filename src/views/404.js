"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';

export class Page404 extends React.Component {
  render () {
    return (
      <Layout id="Page404" className="error-page">
        <h1>404</h1>
        <div className="sub">Sorry the requested page <em>{ this.props.url }</em> does not exist</div>
      </Layout>
    )
  }
}
