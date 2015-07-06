"use strict";

import { assert } from 'chai';
import request from '../src/request';
import sinon from 'sinon';
import config from '../config';
import test_utils from './test_utils';

let AGENT = request.agent;
let PORT = config.app_port;

// fake req object
function requestStub(url) {
  return {
    then: Promise.resolve().then,
    on: function () {},
    url: url,
  };
}

describe('request', () => {
  before(() => {
    test_utils.startServer();
  });
  after(() => {
    test_utils.stopServer();
  });

  afterEach(() => {
    request.agent = AGENT;
    process.browser = false;
  });

  it('wraps the superagent to make urls absolute for the server', () => {
    let agent = request.agent;
    let called;
    request.agent = function (method, url) {
      called = true;
      assert.equal(method, 'GET');
      assert.equal(url, `http://localhost:${PORT}/foo`);
      return requestStub(url);
    };
    request('GET', '/foo');
    assert(called);
  });

  it('does not wrap urls for the client', () => {
    process.browser = true;
    let agent = request.agent;
    let called;
    request.agent = function (method, url) {
      called = true;
      assert.equal(method, 'GET');
      assert.equal(url, '/foo');
      return requestStub(url);
    };
    request('GET', '/foo', {});
    assert(called);
  });

  describe('wrapped methods', () => {
    let methods = ['get', 'head', 'del', 'patch', 'post', 'put'];
    beforeEach(() => {
      methods.forEach(key => {
        sinon.stub(request.agent, key).returns('res');
      });
    });
    afterEach(() => {
      methods.forEach(key => {
        request.agent[key].restore();
      });
    });

    it('make url absolute for the server', () => {
      methods.forEach(key => {
        request[key]('/foo', {});
        request.agent[key].calledWith(`http://localhost:${PORT}/foo`);
      });
    });

    it('leave url unchanged for the browser', () => {
      process.browser = true;
      methods.forEach(key => {
        request[key]('/foo', {});
        request.agent[key].calledWith(`/foo`);
      });
    });
  });

  describe('getCached', () => {
    let agent = request.agent;
    let requests = 0;

    beforeEach(() => {
      request.agent = function (method, url) {
        requests++;
        // fake request
        let req = requestStub(url);
        req.then = function (resolve, reject) {
          return resolve({ body: 'test' });
        };
        return req;
      };
    });

    it('caches the response of a request and does not make the request again', () => {
      return request.getCached('/foo').then(res => {
        return request.getCached('/foo').then(res => {
          assert.equal(requests, 1);
        });
      });
    });
  });

  describe('request object', () => {
    it('should have a "then" method', () => {
      let req = request.get('/foo');
      assert.typeOf(req.then, 'function');
    });

    it('should have a "catch" method', () => {
      let req = request.get('/foo');
      assert.typeOf(req.catch, 'function');
    });

    it('should allow promise chaining', () => {
      return request.get('/api/app-name').then(res => {
        assert.equal(res.status, 200);
      });
    });

    it('should allow promise chaining from catch', () => {
      return request.get('/foo').then(() => assert.fail()).catch(err => {
        assert.equal(err.status, 404);
      });
    });
  })
});
