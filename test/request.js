"use strict";

import { assert } from 'chai';
import request from '../src/request';
import sinon from 'sinon';

let AGENT = request.agent;

describe('request', () => {
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
      assert.equal(url, 'http://localhost:8080/foo');
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
    };
    request('GET', '/foo', {});
    assert(called);
  });

  it('wraps all helper methods on the agent', () => {
    ['get', 'head', 'del', 'patch', 'post', 'put'].forEach(key => {
      try {
        sinon.stub(request.agent, key);
        request[key]('/foo', {});
        request.agent[key].calledWith('http://localhost:8080/foo');
      } catch (err) {
        sinon.restore(request.agent, key);
        throw err;
      }
    });
  });

  describe('getCached', () => {
    let agent = request.agent;
    let requests = 0;

    beforeEach(() => {
      request.agent = function (method, url) {
        requests++;
        // fake request
        return {
          then (resolve, reject) {
            // fake response
            return resolve({ body: 'test' });
          }
        };
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
});
