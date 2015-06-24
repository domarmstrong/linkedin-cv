"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import { Link } from 'react-router';


export default class LookInside extends React.Component {
  render () {

    return (
      <div id="look-inside" className="single-col">
        <h1>Look inside</h1>

        <ul>
          <li><Link className="btn" to="/the-code/files/README.md">The code</Link></li>
          <li><Link className="btn" to="/the-code/tests">Tests</Link></li>
          <li><Link className="btn" to="/the-code/test-coverage">Test coverage</Link></li>
        </ul>
      </div>
    )
  }
}
