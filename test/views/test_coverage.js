"use strict";

import { assert } from 'chai';
import TestCoverage from '../../src/views/test_coverage';
import React from 'react';

describe('Test Coverage page', () => {
  it('renders with no errors', () => {
    React.renderToString( <TestCoverage /> );
  });
});
