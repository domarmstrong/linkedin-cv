"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import router from './router';

export default class Client {
  constructor () {
    console.info('Bootstrap client');
    router.init();
  }
}
