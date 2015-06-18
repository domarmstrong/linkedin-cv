"use strict";

import { assert } from 'chai';
import Contact from '../../src/views/contact';
import React from 'react';

describe('Contact page', () => {
  it('renders with no errors', () => {
    React.renderToString( <Contact /> );
  });
});
