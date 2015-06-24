"use strict";

import { assert } from 'chai';
import { fetchProps } from '../src/app_routes.js'

describe('app_routes', () => {
  describe('fetchProps', () => {
    it('returns a map', () => {
      return fetchProps({ branch: [] }).then(data => {
        assert.instanceOf(data, Map);
      });
    });

    it('fetches props for all components with a fetchProps static method', () => {
      let A = { fetchProps () { return 'a' } };
      let B = { fetchProps () { return 'b' } };
      let C = { fetchProps () { return 'c' } };

      let state = {
        branch: [
          { component: A },
          { component: B },
          { component: C }
        ],
      };

      return fetchProps(state).then(data => {
        assert.equal(data.get(A), 'a');
        assert.equal(data.get(B), 'b');
        assert.equal(data.get(C), 'c');
      });
    });

    it('ignores components with no fetchProps static method', () => {
      let A = { fetchProps () { return 'a' } };
      let B = { fetchMilk () { return 'b' } };
      let C = { fetchProps () { return 'c' } };

      let state = {
        branch: [
          { component: A },
          { component: B },
          { component: C }
        ],
      };

      return fetchProps(state).then(data => {
        assert.equal(data.get(A), 'a');
        assert.equal(data.get(B), undefined);
        assert.equal(data.get(C), 'c');
      });
    });

    it('catches synchronous errors', () => {
      let A = { fetchProps () { throw new Error('test'); } };

      let state = {
        branch: [
          { component: A },
        ],
      };

      let error;
      return fetchProps(state).catch(err => {
        error = err;
      }).then(() => {
        assert.equal(error.message, 'test');
      });
    });

    it('catches asynchronous errors', () => {
      let A = { fetchProps () { return Promise.reject(new Error('test')); } };

      let state = {
        branch: [
          { component: A },
        ],
      };

      let error;
      return fetchProps(state).catch(err => {
        error = err;
      }).then(() => {
        assert.equal(error.message, 'test');
      });
    });
  });
});
