"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';


export default class TestCoverage extends React.Component {
  render () {

    return (
      <div id="test-coverage" className="single-col">
        <h1>Tests coverage</h1>

        <iframe src="/test-coverage/index.html" />
      </div>
    )
  }
}
