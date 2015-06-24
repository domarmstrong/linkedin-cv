"use strict";

import { assert } from 'chai';
import TestCoverage from '../../src/views/test_coverage';
import React from 'react';
import test_utils from '../test_utils';

describe('Test Coverage page', () => {
  it('renders with no errors', () => {
    return test_utils.renderWithRouter(TestCoverage);
  });
});
