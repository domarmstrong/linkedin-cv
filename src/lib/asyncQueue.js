"use strict";

/**
 * Async queue, run async tasks synchronously, only allows 1 entry at a time for each key
 * Each time the queue runs, every handler function is run with its queue position.
 *
 * Note: only the current item is passed the done function.
 *
 * @Example:
 * ```
 * let q = new AsyncQueu();
 * ['a','b','c'].forEach(key => {
 *   q.push(key, {}, (key, value, position, done) {
 *     console.log(key, position);
 *     if (done) {
 *       // done some async work
 *       setTimeout(done, 50);
 *     }
 *   });
 * });
 * >>>
 * a 0
 * b 1
 * c 2
 * b 0
 * c 1
 * c 0
 * ```
 *
 * Author: Dom Armstrong, Date: 20/07/15
 */


export class AsyncQueue {
  constructor () {
    // Use a Map for the test queue as it has keys and a guaranteed iteration order
    this.queue = new Map();
    this.inprogress = false;
  }

  /**
   * Add an item to queue
   * @param key (Unique key to queue)
   * @param value (data for use by onQueueChange)
   * @param onChange {Function} (key, value, queuePosition<number>, done<func>)
   */
  push (key, value, onChange) {
    // Don't queue multiple test runs for the same key
    if (this.queue.has(key)) {
      console.log('ignoring key: ', key);
      return;
    }
    this.queue.set(key, { value: value, onChange: onChange });
    if (this.inprogress) {
      // If in progress, run the change handler immediately with its queue position
      onChange(key, value, this.queue.size - 1);
    } else {
      this.update();
    }
  }

  update () {
    if (this.inprogress) return;
    if (! this.queue.size) return;
    this.inprogress = true;

    let finished = false; // The currently in progress item has finished
    let current; // The key of the current item at 0
    let i = 0;
    let size = this.queue.size;
    let keys = this.queue.keys();

    let next = () => {
      let _key = keys.next();

      if (_key.done) {
        // iteration complete and async item complete
        // delete the current item from the queue and move to the next
        if (finished) {
          finished = false;
          this.queue.delete(current);
          this.inprogress = false;
          this.update();
        }
        return;
      }

      let key = _key.value;
      let data = this.queue.get(_key.value);
      let done = null;
      if (i === 0) {
        current = key;
        let called = false;
        done = () => {
          if (called) {
            throw new Error('Done called more than once');
          }
          called = true;
          finished = true;
          next();
        }
      }
      data.onChange(key, data.value, i, done);
      i++;
      next();
    };
    next();
  }

  getLength () {
    return this.queue.size;
  }
}
