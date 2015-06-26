"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import Login from '../../src/views/login';
import React from 'react';
import test_utils from '../test_utils';
import TestUtils from 'react/addons/TestUtils';
import auth from '../../src/server/auth';

describe.only('Login page', () => {
  it('renders with no errors', () => {
    React.renderToString( <Login /> );
  });

  it('renders login validation errors', () => {
    let rendered = React.renderToStaticMarkup( <Login validation={{ login: 'login failed' }} /> );
    assert.match(rendered, /<div class="form-validation">login failed<\/div>/);
  });

  context('when mounted', () => {
    before(() => {
      return auth.createUser('testUser', 'testPass');
    });
    after(() => {
      return auth.deleteUser('testUser');
    });

    describe('the submit button', () => {
      it('triggers the submit action with username and password', () => {
        return test_utils.renderWithRouter(Login).then(comp => {
          comp.submit = sinon.stub();
          let username = React.findDOMNode(comp.refs.username);
          let password = React.findDOMNode(comp.refs.password);
          let submit = React.findDOMNode(comp.refs.submit);

          TestUtils.Simulate.change(username, { target: { value: 'dominataa' }});
          TestUtils.Simulate.change(password, { target: { value: 'abcdef' }});
          TestUtils.Simulate.click(submit);
          assert(comp.submit.calledWith('dominataa', 'abcdef'), 'submit should be called with username and password');
        });
      });
    });

    describe('submit', () => {
      it('sets the validation on failed login', () => {
        return test_utils.renderWithRouter(Login).then(comp => {
          return comp.submit('foo', 'bar').then(() => {
            assert.deepEqual(comp.state.validation, { login: 'Username or password incorrect' });
          });
        });
      });

      it('redirects based on the querystring on success', () => {
        let router = { transitionTo: sinon.stub() };
        return test_utils.renderWithRouter(Login, {}, { router }).then(comp => {
          return comp.submit('testUser', 'testPass').then(() => {
            assert.equal(router.transitionTo.args[0][0], '/admin');
          });
        });
      });
    });
  });
});
