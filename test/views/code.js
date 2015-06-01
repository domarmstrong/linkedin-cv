"use strict";

import { assert } from 'chai';
import Code from '../../src/views/code';
import React from 'react';

describe('Tests page', () => {
  it.skip('should render with no errors', () => {
    React.renderToString( <Code /> );
  });
});
