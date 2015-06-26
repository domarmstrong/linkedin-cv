"use strict";

import { assert } from 'chai';
import Login from '../../src/views/login';
import React from 'react';

describe('Login page', () => {
  it('renders with no errors', () => {
    React.renderToString( <Login /> );
  });

  it('renders login validation errors', () => {
    let rendered = React.renderToStaticMarkup( <Login validation={{ login: 'login failed' }} /> );
    assert.match(rendered, /<div class="form-validation">login failed<\/div>/);
  });
});
