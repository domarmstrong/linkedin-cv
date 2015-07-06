"use strict";

import { assert } from 'chai';
import Error from '../../src/views/error';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Error page', () => {
  it('renders with no errors', () => {
    ReactDOM.renderToString( <Error status={ 500 } error="Some error" /> );
  });
});
