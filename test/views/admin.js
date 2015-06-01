"use strict";

import { assert } from 'chai';
import Admin from '../../src/views/admin';
import React from 'react';

describe('Admin page', () => {
  it('should render with no errors', () => {
    React.renderToString( <Admin /> );
  });
});
