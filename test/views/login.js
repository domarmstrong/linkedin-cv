"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import Login from '../../src/views/login';
import React from 'react';
import ReactDOM from 'react-dom/server';
import test_utils from '../test_utils';
import TestUtils from 'react/lib/ReactTestUtils';
import client from '../../src/client/bootstrap';

describe('Login page', () => {
  it('renders with no errors', () => {
    ReactDOM.renderToString( <Login /> );
  });

  it('renders login validation errors', () => {
    let rendered = ReactDOM.renderToStaticMarkup( <Login validation={{ login: 'login failed' }} /> );
    assert.match(rendered, /<div class="form-validation">login failed<\/div>/);
  });

  context('when mounted', () => {
    beforeEach(() => {
      sinon.stub(client, 'login').returns(Promise.resolve());
    });
    afterEach(() => {
      client.login.restore();
    });

    describe('the submit button', () => {
      beforeEach(() => {
        sinon.stub(Login.prototype, 'submit').returns(Promise.resolve());
      });
      afterEach(() => {
        Login.prototype.submit.restore();
      });

      it('triggers the submit action with username and password', () => {
        return test_utils.renderWithRouter(Login).then(comp => {
          let username = comp.refs.username;
          let password = comp.refs.password;
          let submit = comp.refs.submit;

          TestUtils.Simulate.change(username, { target: { value: 'dominataa' }});
          TestUtils.Simulate.change(password, { target: { value: 'abcdef' }});
          TestUtils.Simulate.click(submit);
          assert(comp.submit.calledWith('dominataa', 'abcdef'), 'submit should be called with username and password');
        });
      });
    });

    describe('submit', () => {
      it('sets the validation on failed login', () => {
        client.login.returns(Promise.reject(new Error('Username or password incorrect')));

        return test_utils.renderWithRouter(Login).then(comp => {
          return comp.submit('foo', 'bar').then(() => {
            assert.deepEqual(comp.state.validation, { login: 'Username or password incorrect' });
          });
        });
      });

      it('redirects based on the querystring on success', () => {
        let router = { transitionTo: sinon.stub() };
        return test_utils.renderWithRouter(Login, {}, { router }, '/login?then=%2Ffoo').then(comp => {
          return comp.submit('testUser', 'testPass').then(() => {
            assert.deepEqual(comp.state.validation, {}); // should be no validation
            assert.equal(router.transitionTo.args[0][0], '/foo');
          });
        });
      });

      it('redirects to /admin if no querystring', () => {
        let router = { transitionTo: sinon.stub() };
        return test_utils.renderWithRouter(Login, {}, { router }, '/login').then(comp => {
          return comp.submit('testUser', 'testPass').then(() => {
            assert.deepEqual(comp.state.validation, {}); // should be no validation
            assert.equal(router.transitionTo.args[0][0], '/admin');
          });
        });
      });
    });
  });
});
