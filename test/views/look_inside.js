"use strict";

import { assert } from 'chai';
import LookInside from '../../src/views/look_inside';
import React from 'react';
import test_utils from '../test_utils';

describe('Look inside page', () => {
  it('renders with no errors', () => {
    return test_utils.renderWithRouter(LookInside);
  });
});
