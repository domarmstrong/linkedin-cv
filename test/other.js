"use strict";

import { assert } from 'chai';

describe('test', () => {
  it('should', () => {
    assert(true, 'It does');
  });
  it('should not', () => {
    throw new Error('nope');
  });
  it('should async', done => {
    setTimeout(done, 1500);
  });
  it('should timeout', done => { });
});
