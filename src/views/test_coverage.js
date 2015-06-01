"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';


export default class TestCoverage extends React.Component {
  render () {

    return (
      <Layout id="test-coverage">
        <div className="single-col">
          <h1>Tests coverage</h1>

          <iframe src="/test-coverage/index.html" />
        </div>
      </Layout>
    )
  }
}
