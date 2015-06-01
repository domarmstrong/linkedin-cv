"use strict";

import { assert } from 'chai';

describe('test', () => {
  it('should', () => {
    assert(true, 'It does');
  });

  it('should also', () => {
    assert.deepEqual({a:1}, {a:1});
  })
});
