"use strict";

/**
 * Author: Dom Armstrong, Date: 18/08/15
 */

import React from 'react';

export default class OptimiseWebsite extends React.Component {
  render () {
    let style={marginRight: 5};
    return (
      <div id="Optimise" className="portfolio-page single-col">
        <h1>Optimise website</h1>
        <div style={{ marginBottom: 10 }}>
          <img style={style} src="/public/img/optimise-site-a1_half.png" />
          <img style={style} src="/public/img/optimise-site-a2_half.png" />
          <img style={style} src="/public/img/optimise-site-a3_half.png" />
        </div>
        <div>
          <img style={style} src="/public/img/optimise-site-b1_half.png" />
          <img style={style} src="/public/img/optimise-site-b2_half.png" />
          <img style={style} src="/public/img/optimise-site-b3_half.png" />
        </div>
      </div>
    );
  }
}
