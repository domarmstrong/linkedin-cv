"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import classNames from 'classnames';
import request from '../request';


export default class Tests extends React.Component {

  constructor () {
    super();

    this.state = {
      liveResult: null,
      isMounted: false,
    };
  }

  static fetchProps () {
    return request.get('/api/test-results', { json: true }).then(res => ({ testResults: res.body }))
  }

  componentDidMount () {
    this.setState({ isMounted: true });
  }

  handleRunTests () {

  }

  renderResults () {
    let result = this.state.liveResult || this.props.testResults;
    console.log(this.props);

    return result.map((entry, i) => {
      let [ type, data ] = entry;
      switch (type) {
        case 'start':
          return  this.renderStart(data);
        case 'end':
          return  this.renderEnd(data);
        case 'pass':
        case 'fail':
          return  this.renderTest(type, data, i);
        default:
          throw new Error('Unexpected result type: ' + type);
      }
    });
  }

  renderDuration (duration) {
    return Number(duration / 1000).toFixed(2) + ' s';
  }

  renderStart ({ total }) {
    let isSavedResult = !this.state.liveResult;
    return (
      <li key="start" className="initialize">
        { isSavedResult ? (
          <h2>Saved test result for { total } tests</h2>
        ) : (
          <h2>Running { total } tests...</h2>
        )}
      </li>
    );
  }

  renderEnd ({ passes, failures, pending, duration }) {
    return (
      <li key="end" className="summary">
        <ul>
          <li className="pass">Passing: { passes }
            <span className="duration">({ this.renderDuration(duration) })</span>
          </li>
          <li className="pending">Pending: { pending }</li>
          <li className="fail">Failing: { failures }</li>
        </ul>
      </li>
    );
  }

  renderTest (result, { fullTitle, duration }, key) {
    return (
      <li key={ key } className={ classNames('test', result) }>
        { fullTitle }
        <span className="duration">({ this.renderDuration(duration) })</span>
      </li>
    );
  }

  render () {
    return (
      <div id="tests" className="single-col">
        <h1>Tests</h1>

        { this.state.isMounted && <button onClick={ this.handleRunTests }>Run tests</button> }

        <ul className="tests">
          { this.renderResults() }
        </ul>
      </div>
    )
  }
}
Tests.propTypes = {
  testResults: React.PropTypes.object.isRequired,
};
