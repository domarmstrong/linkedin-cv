"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

// Import polyfills as required to keep bundle size down
import 'core-js/fn/object/assign';
import 'core-js/es6/promise';
import 'core-js/es6/map';
import Client from './client';

let client = new Client();

if (typeof window !== 'undefined') {
  window.client = client;
}

export default client;

client.init();
