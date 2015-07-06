"use strict";

import { assert } from 'chai';
import Admin from '../../src/views/admin';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Admin page', () => {
  it('renders with no errors', () => {
    ReactDOM.renderToString( <Admin /> );
  });
});
