"use strict";

import { assert } from 'chai';
import CV, { Position, formatParas } from '../../src/views/cv';
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
      positions: [{
        company: { name: 'foo' },
        id: 1,
        isCurrent: true,
        startDate: { month: 6, year: 2015 },
        summary: 'foo',
        title: 'foo',
      },
      {
        company: { name: 'bar' },
        id: 2,
        isCurrent: false,
        startDate: { month: 1, year: 2012 },
        endDate: { month: 2, year: 2015 },
        summary: 'bar',
        title: 'bar',
      }],
      skills: [{ id: 1, name: 'foo' }],
      educations: [{ id: 1, name: 'bar' }],
    };
  });

  it('renders with no errors', () => {
    React.renderToString( <CV { ...props } /> );
  });

  describe('fetchProps', () => {
    it('runs without error', () => {
      return CV.fetchProps().then(data => {
        assert.typeOf(data, 'object');
      });
    });
  });

  describe('Position', () => {
    describe('getTimeSpent', () => {
      it('returns pluralizes months and years', () => {
        let time = Position.getTimeSpent({ month: 1, year: 2013 }, { month: 3, year: 2015 });
        assert.equal(time, '2 years 2 months');
      });

      it('returns does not pluralize month and year', () => {
        let time = Position.getTimeSpent({ month: 1, year: 2014 }, { month: 2, year: 2015 });
        assert.equal(time, '1 year 1 month');
      });

      it('returns only months if years are the same', () => {
        let time = Position.getTimeSpent({ month: 1, year: 2015 }, { month: 3, year: 2015 });
        assert.equal(time, '2 months');
      });

      it('returns only years if months are the same but years are different', () => {
        let time = Position.getTimeSpent({ month: 1, year: 2014 }, { month: 1, year: 2015 });
        assert.equal(time, '1 year');
      });

      it('returns 1 month less than a month', () => {
        let time = Position.getTimeSpent({ month: 1, year: 2015 }, { month: 1, year: 2015 });
        assert.equal(time, '1 month');
      });

      it('current date if no endDate passed', () => {
        let now = new Date();
        let time = Position.getTimeSpent({ month: now.getMonth() + 1, year: now.getFullYear() - 2 });
        assert.equal(time, '2 years');
      });
    });
  })

  describe('formatParas', () => {
    it('returns the value unchanged if not a string', () => {
      assert.equal(formatParas(null), null);
    });

    it('splits a string on newline chars and returns an array of react paragraph elements', () => {
      let paras = formatParas('a\nb\nc');
      assert.isArray(paras);
      assert.lengthOf(paras, 3);
      paras.forEach((p, i) => {
        assert.equal(p.type, 'p');
        assert.equal(p.key, i);
      });
    });

    it('splits ignores extra newlines', () => {
      let paras = formatParas('a\nb\n\nc\n\n');
      assert.lengthOf(paras, 3);
    });
  });
});
