"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';


export default class LookInside extends React.Component {
  render () {

    return (
      <div id="look-inside" className="single-col">
        <h1>Look inside</h1>

        <ul>
          <li><a className="btn" href="/the-code/README.md">The code</a></li>
          <li><a className="btn" href="/the-code/tests">Tests</a></li>
          <li><a className="btn" href="/the-code/test-coverage">Test coverage</a></li>
        </ul>
      </div>
    )
  }
}
