"use strict";

import { assert } from 'chai';
import App from '../../src/views/app';
import React from 'react';
import test_utils from '../test_utils';

describe('app view', () => {
  before(() => {
    test_utils.startServer();
  });
  after(() => {
    test_utils.stopServer();
  });

  it('renders with no errors', () => {
    test_utils.renderWithRouter(App, { app_name: 'test' });
  });

  describe('fetchProps', () => {
    it('gets the app_name', () => {
      return App.fetchProps().then(data => {
        assert.isDefined(data.app_name);
      });
    });
  });
});
