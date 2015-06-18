"use strict";

import { assert } from 'chai';
import Login from '../../src/views/login';
import React from 'react';

describe('Login page', () => {
  it('renders with no errors', () => {
    React.renderToString( <Login /> );
  });
});
