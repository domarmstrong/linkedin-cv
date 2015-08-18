"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import { Link } from 'react-router';
import { InfoPanel } from '../components/info_panel';

export default class LookInside extends React.Component {
  render () {
    return (
      <div id="look-inside" className="links-page">
        <h1>Look inside</h1>

        <ul className="links">
          <InfoPanel img="/public/img/files.png" title="Files" href="/the-code/files">
            Have a look at the files behind this site. For example to see the code behind this page
            navigate to <Link to="/the-code/files/src/views/look_inside.js"><code>src/views/look_inside.js</code></Link>
          </InfoPanel>

          <InfoPanel img="/public/img/tests.png" title="Tests" href="/the-code/tests">
            View the results of the last saved test run, or run the test suit live from the server.
            The tests are written with&nbsp;
            <a target="_blank" href="http://mochajs.org/">Mocha</a> and&nbsp;
            <a target="_blank" href="http://chaijs.com/api/assert/">Chai</a> and utilise&nbsp;
            <a target="_blank" href="https://github.com/tmpvar/jsdom">JSDom</a> to run all tests within a node process.
          </InfoPanel>

          <InfoPanel img="/public/img/coverage.png" title="Test Coverage" href="/the-code/test-coverage">
            See the test coverage report. The report is generated with&nbsp;
            <a target="_blank" href="http://gotwarlost.github.io/istanbul/">Istanbul</a> and source mapped to the es6 code.
          </InfoPanel>
        </ul>
      </div>
    )
  }
}
