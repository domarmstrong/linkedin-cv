"use strict";

import { assert } from 'chai';
import CV from '../../src/views/cv';
import React from 'react';

describe('CV page', () => {
  let props;

  beforeEach(() => {
    props = {
      firstName: 'Testy',
      lastName: 'McTest',
      headline: 'Blah blah blah',
      location: 'Somewhere',
      industry: 'IT',
      email: 'test@test.com',
      publicProfile: 'linkedin.com/test',
      summary: 'Jabber jabber jabber',
      specialties: 'Foo Bar Baz',
      positions: [],
      skills: [],
      educations: [],
    };
  });

  it('renders with no errors', () => {
    React.renderToString( <CV { ...props } /> );
  });
});
