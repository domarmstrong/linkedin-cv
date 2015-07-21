"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 */

import React from 'react';
import classNames from 'classnames';
import request from '../request';
import autobind from 'autobind-decorator';
import client from '../client/bootstrap';
import time from '../lib/time';


export default class Tests extends React.Component {

  constructor () {
    super();

    this.state = {
      running: false,
      info: [],
      liveResult: null,
      isMounted: false,
      error: null,
    };
  }

  static fetchProps () {
    return request.get('/api/test-results', { json: true }).then(res => ({ savedResult: res.body }))
  }

  componentDidMount () {
    this.setState({ isMounted: true });

    client.socket.on('test-info', data => {
      this.state.info.push(data);
      this.forceUpdate();
    });
    client.socket.on('test-result', result => {
      this.state.liveResult.push(result);
      this.forceUpdate();
    });
    client.socket.on('test-error', err => {
      this.setState({
        error: {
          message: 'Woops. An error occured while running the test suit...',
          error: err
        }
      });
    });
    client.socket.on('test-end', () => {
      this.setState({ running: false });
    });
  }

  componentWillUnmount () {
    client.socket.off('test-result');
    client.socket.off('test-error');
  }

  @autobind
  handleRunTests () {
    if (this.state.running) return;

    // need to set state sync for testing
    this.setState({
      running: true,
      info: ['Request test run'],
      liveResult: [],
      error: null,
    });
    client.socket.emit('run-tests');
  }

  getData () {
    let { savedResult } = this.props;
    let { liveResult, info } = this.state;

    let results = liveResult || savedResult;
    let tests = [];
    let stats;

    let testCount = 0;
    // Find start data, iterate forward (should be first row)
    for (var i = 0; i < results.length; i++) {
      let row = results[i];
      switch (row[0]) {
        case 'start':
          testCount = results[i][1].total;
          break;
        case 'end':
          stats = results[i][1];
          break;
        case 'pass':
        case 'fail':
          tests.push(row);
          break;
        default:
          throw new Error('Unexpected result type: ' + row);
      }
    }

    return {
      testCount,
      info,
      tests,
      stats,
    };
  }

  render () {
    let { error, running } = this.state;

    return (
      <div id="tests">
        { this.state.isMounted && (
          <button className="run-test-btn" disabled={ running } onClick={ this.handleRunTests }>
            Run tests live <i className="icon-play-circle-outline" />
          </button>
        )}

        <TestResults data={ this.getData() } error={ error } />
      </div>
    )
  }
}
Tests.propTypes = {
  savedResult: React.PropTypes.array.isRequired,
};

class TestResults extends React.Component {
  componentDidUpdate () {
    let list = this.refs.tests;
    list.scrollTop = list.scrollHeight;
  }

  getProgress () {
    return this.props.data.tests.map(test => test[0]);
  }

  renderResults () {
    let { data, error } = this.props;

    let info = data.info.map((entry, i) => {
      return <li key={ 'init-' + i } className="test-info">{ entry }</li>;
    });

    let tests = data.tests.map((entry, i) => {
      return  this.renderTest(entry[0], entry[1], i + 1);
    });

    let stats = data.stats ? this.renderStats(data.stats) : [];

    let err = error ? [
      <li key="message" className="error"><h2>{ error.message }</h2></li>,
      <li key="error" className="error"><pre><code>{ error.error }</code></pre></li>,
    ] : [];

    return [].concat(info, tests, stats, err);
  }

  renderTest (result, { fullTitle, duration }, num) {
    let icon = 'icon-' + (result === 'pass' ? 'check' : 'dnd-forwardslash');
    return (
      <li key={ num } className="test">
        { num }) <i className={ classNames(icon, result) } /> <span className={ result }>{ fullTitle }</span>
        <span className="duration">({ time.renderDuration(duration) })</span>
      </li>
    );
  }

  renderStats ({ passes, failures, pending, duration }) {
    return (
      <li key="end" className="summary">
        <ul>
          <li className="pass">Passing: { passes }
            <span className="duration">({ time.renderDuration(duration) })</span>
          </li>
          <li className="pending">Skipped: { pending }</li>
          <li className="fail">Failing: { failures }</li>
        </ul>
      </li>
    );
  }

  render () {
    let { data } = this.props;
    return (
      <div className="test-results">
        <ProgressBar total={ data.testCount } progress={ this.getProgress() } />
        <ul ref="tests" className="tests">
          { this.renderResults() }
        </ul>
      </div>
    );
  }
}

/**
 * Render a progress bar with blocks of color
 * @example:
 * ```
 * <ProgressBar total={ 10 } progress={[ 'red', 'red', 'green' ]} />
 * ```
 */
class ProgressBar extends React.Component {
  renderProgress () {
    let { total, progress } = this.props;
    let bars = [];
    let width = 100 / total;
    for (var i = 0; i < total; i++) {
      let className = classNames('bar', progress[i]);
      bars.push(<div key={ i } className={ className } style={{ width: width + '%' }} />);
    }
    return bars;
  }

  render () {
    return (
      <div className="progress-bar">
        { this.renderProgress() }
      </div>
    );
  }
}
ProgressBar.propTypes = {
  total: React.PropTypes.number.isRequired,
  progress: React.PropTypes.array.isRequired,
};
