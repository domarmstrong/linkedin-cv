"use strict";

import { assert } from 'chai';
import Page404 from '../../src/views/404';
import React from 'react';

describe('404 page', () => {
  it('renders with no errors', () => {
    React.renderToString( <Page404 routerState={{ location: { pathname: '/' }}} /> );
  });
});
