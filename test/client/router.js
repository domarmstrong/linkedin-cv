"use strict";

import { assert } from 'chai';
import sinon from 'sinon';
import router from '../../src/client/router';
import { Route } from 'react-router';
import React from 'react';
import Router from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import Location from 'react-router/lib/Location';

describe('router', () => {
  let Comp;
  let history = new MemoryHistory([ '/' ]);
  let onChange;
  history.addChangeListener(function () {
    if (onChange) onChange();
  });

  beforeEach(() => {
    Comp = class Comp extends React.Component {
      render () { return <div /> }
    };
  });

  describe('onTransition', () => {
    it('calls fetchProps before routing to the page', () => {
      Comp.fetchProps = sinon.stub();
      return router.init(null, history, <Route path="*" component={ Comp } />).then(router => {
        assert(Comp.fetchProps.called, 'fetchProps should be called on route components');
      });
    });

    it('catches errors in fetchProps functions', () => {
      Comp.fetchProps = sinon.stub().throws(new Error('fetchProps error'));
      return router.init(null, history, <Route path="*" component={ Comp } />).then(router => {
        throw new Error(); // ensure catch is called
      }).catch(err => {
        assert.equal(err.message, 'fetchProps error');
      });
    });

    it('redirects to login if route requires login', done => {
      let location = new Location('/');

      let routes = (
        <Route path="/" component={ Comp }>
          <Route path="foo" component={ Comp } loginRequired={ true } />
          <Route path="login" component={ Comp } />
        </Route>
      );
      router.init(location, history, routes).then(router => {
        // Cant find a sensible way to test transition end..
        onChange = function () {
          if (history.location.pathname === '/login') done();
        };
        router.transitionTo('/foo');
      });
    });
  });
});
