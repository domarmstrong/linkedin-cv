"use strict";

import { assert } from 'chai';
import Tests from '../../src/views/tests';
import React from 'react';

describe('Tests page', () => {
  it('should render with no errors', () => {
    React.renderToString( <Tests /> );
  });
});
