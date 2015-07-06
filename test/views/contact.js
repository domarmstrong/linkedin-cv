"use strict";

import { assert } from 'chai';
import Contact from '../../src/views/contact';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Contact page', () => {
  it('renders with no errors', () => {
    ReactDOM.renderToString( <Contact /> );
  });
});
