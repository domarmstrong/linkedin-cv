"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

// Import polyfills as required to keep bundle size down
import 'core-js/fn/object/assign';
import Client from './client';

window.client = new Client();
