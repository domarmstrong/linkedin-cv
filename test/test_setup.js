"use strict";

/**
 * Author: Dom Armstrong, Date: 26/06/15
 */

import jsdom from 'jsdom';

// Creates a DOM environment assigning global `window` and `document` if not present
(function () {
  if (typeof window !== 'undefined') return;
  let doc = jsdom.jsdom('<body><div id="_mount"></div></body>', {});
  global.window = doc.parentWindow;
  global.document = window.document;
  global.navigator = window.navigator;
  global.location = window.location;
}());

// Spin up a test server to allow actually testing communication with server
require(process.cwd()).init();

