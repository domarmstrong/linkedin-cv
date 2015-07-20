"use strict";

import { assert } from 'chai';
import { AsyncQueue } from '../../src/lib/asyncQueue';

describe('AsyncQueue', () => {
  let queue;
  beforeEach(() => {
    queue = new AsyncQueue();
  });

  it('runs the first item immediately', () => {
    let run = false;
    queue.push('a', 1, (key, value, position, done) => {
      run = true;
      done();
    });
    assert(run);
  });

  it('items added are run synchronously', (did) => {
    let order = [];
    ['a','b','c'].forEach(key => {
      queue.push(key, {}, (key, value, position, done) => {
        if (done) {
          order.push(key);
          setTimeout(() => {
            done();
            if (queue.getLength() === 0) {
              assert.deepEqual(order, ['a','b','c']);
              did();
            }
          }, 1);
        }
      });
    });
  });

  it('onChange handlers are run with their queue position each time the queue iterates', (did) => {
    let order = [];
    ['a','b','c'].forEach(key => {
      queue.push(key, {}, (key, value, position, done) => {
        order.push({ key, position });
        if (done) {
          setTimeout(() => {
            done();
            if (queue.getLength() === 0) {
              assert.deepEqual(order, [
                { key: 'a', position: 0 },
                { key: 'b', position: 1 },
                { key: 'c', position: 2 },
                { key: 'b', position: 0 },
                { key: 'c', position: 1 },
                { key: 'c', position: 0 },
              ]);
              did();
            }
          }, 1);
        }
      });
    });
  });

  it('ignores multiple pushes of the same key', (did) => {
    let order = [];
    ['a','a','b', 'a'].forEach(key => {
      queue.push(key, {}, (key, value, position, done) => {
        order.push({ key, position });
        if (done) {
          setTimeout(() => {
            done();
            if (queue.getLength() === 0) {
              assert.deepEqual(order, [
                { key: 'a', position: 0 },
                { key: 'b', position: 1 },
                { key: 'b', position: 0 },
              ]);
              did();
            }
          }, 1);
        }
      });
    });
  })
});

