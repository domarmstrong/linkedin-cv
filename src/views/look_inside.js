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

        <a className="btn" href="/the-code/README.md">The code</a>

        <a className="btn" href="/the-code/tests">Tests &amp; coverage</a>
      </div>
    )
  }
}
