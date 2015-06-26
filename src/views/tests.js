"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import classNames from 'classnames';
import request from '../request';
import autobind from 'autobind-decorator';


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

    client.socket.on('test-result', result => {
      this.state.liveResult.push(result);
      this.forceUpdate();
    });
    client.socket.on('test-error', err => {
      console.log(err);
      this.setState({
        liveResult: [],
        error: {
          message: 'Woops. An error occured while running the test suit...',
          error: err
        }
      });
    });
  }

  componentWillUnmount () {
    client.socket.off('test-result');
    client.socket.off('test-error');
  }

  @autobind
  handleRunTests () {
    // need to set state sync for testing
    this.setState({
      liveResult: [],
      error: null,
    });

    client.socket.emit('run-tests');
  }

  renderResults () {
    let { liveResult, error } = this.state;

    if (error) {
      return [
        <li key="message" className="error"><h2>{ error.message }</h2></li>,
        <li key="error" className="error"><pre><code>{ error.error }</code></pre></li>,
      ]
    }
    else if (liveResult && ! liveResult.length) {
      return <li><h2>Running...</h2></li>;
    }

    let result = liveResult || this.props.testResults;
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
          <li className="pending">Skipped: { pending }</li>
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
  testResults: React.PropTypes.array.isRequired,
};
