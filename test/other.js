"use strict";

import { assert } from 'chai';

describe('test', () => {
  it('should', () => {
    assert(true, 'It does');
  });
  it('should not', () => {
    throw new Error('nope');
  });
  it.skip('should async', done => {
    setTimeout(done, 12);
  });
});
