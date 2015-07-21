"use strict";

import { assert } from 'chai';
import Tests from '../../src/views/tests';
import test_utils from '../test_utils'
import client from '../../src/client/bootstrap';
import { EventEmitter } from 'events';
import TestUtils from 'react/lib/ReactTestUtils';
import $ from 'jquery';

describe('Tests page', () => {
  let savedResult;
  before(() => {
    test_utils.startServer();
  });
  after(() => {
    test_utils.stopServer();
  });

  beforeEach(() => {
    savedResult = [
      [ "start" , { "total" : 3}],
      [ "pass" , { "title" : "a" , "fullTitle" : "a" , "duration" : 46}],
      [ "pass" , { "title" : "b" , "fullTitle" : "b" , "duration" : 14}],
      [ "pass" , { "title" : "c" , "fullTitle" : "c" , "duration" : 46}],
      [ "end" , { "suites" : 3 , "tests" : 3 , "passes" : 3 , "pending" : 0 , "failures" : 0 , "start" : "2015-06-25T13:23:15.615Z" , "end" : "2015-06-25T13:23:15.804Z" , "duration" : 189}]
    ];
    client._socket = new EventEmitter();
    // annoying add 'off' thats compatible with socketIO
    client._socket.off = function (name) {
      client._socket.listeners(name).forEach(fn => {
        client.socket.removeListener(name, fn);
      });
    }
  });

  afterEach(() => {
    client._socket = null;
  });

  it('renders with no errors', () => {
    return test_utils.renderWithRouter(Tests, { savedResult });
  });

  it('adds event listeners on mount', () => {
    return test_utils.renderWithRouter(Tests, { savedResult }).then(comp => {
      assert.equal(client.socket.listeners('test-result').length, 1);
      assert.equal(client.socket.listeners('test-error').length, 1);
    });
  });

  it('cleans up listeners on unmount', () => {
    return test_utils.renderWithRouter(Tests, { savedResult }).then(comp => {
      comp.componentWillUnmount();
      assert.equal(client.socket.listeners('test-result').length, 0);
      assert.equal(client.socket.listeners('test-error').length, 0);
    });
  });

  describe('render', () => {
    it('throws an error if an unexpected result is found', () => {
      savedResult.push(['badResult']);
      return test_utils.renderWithRouter(Tests, { savedResult }).then(assert.fail).catch(err => {
        assert.match(err.message, /^Unexpected result type/);
      });
    });
  });

  describe('runs tests', () => {
    it('renders with the live results as they stream', () => {
      return test_utils.renderWithRouter(Tests, { savedResult }).then(comp => {
        client.socket.on('run-tests', () => {
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'test').length, 0);
          client.socket.emit('test-result', ['start', { total: 2 }]);
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'test').length, 0);
          client.socket.emit('test-result', [ "pass" , { "title" : "a" , "fullTitle" : "a" , "duration" : 46}]);
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'test').length, 1);
          client.socket.emit('test-result', [ "pass" , { "title" : "b" , "fullTitle" : "b" , "duration" : 14}]);
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'test').length, 2);
        });
        comp.handleRunTests();
      });
    });

    it('renders errors returned', () => {
      return test_utils.renderWithRouter(Tests, { savedResult }).then(comp => {
        client.socket.on('run-tests', () => {
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'error').length, 0);
          client.socket.emit('test-error', 'ERROR');
          assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(comp, 'error').length, 2);
        });
        comp.handleRunTests();
      });
    });
  });

  describe('fetchProps', () => {
    it('runs without error', () => {
      return Tests.fetchProps().then(data => {
        assert.typeOf(data, 'object');
        assert.typeOf(data.savedResult, 'array');
      });
    });
  });
});
