"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';


export default class Tests extends React.Component {

  renderResults () {
    return
  }

  render () {
    return (
      <Layout id="tests">
        <div className="single-col">
          <h1>Tests</h1>

          { this.renderResults() }
        </div>
      </Layout>
    )
  }
}
Tests.propTypes = {
  data: React.PropTypes.array,
};
