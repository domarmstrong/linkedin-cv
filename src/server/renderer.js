"use strict";

import Qfs from 'q-io/fs';
import React from 'react';
import _ from 'underscore';
import path from 'path';
import util from 'util';
import { ContextWrapper } from '../components/context_wrapper';

const config = require(path.join(process.cwd(), 'config.js'));

/**
 * Get the compiled html template page and cache it
 * @return {String} html
 */
let htmlTemplate = '';
function getHtmlTemplate() {
  // Return cached version
  if (htmlTemplate) {
    return Promise.resolve(htmlTemplate);
  }

  return Qfs.read(path.join(__dirname, '../../', '/public/index.html')).then(html => {
    // Compile to underscore template and return a partial function
    // which only requires the body html string to be passed
    htmlTemplate =  function (body) {
      return _.template(html)({
        globals: `
          <script>
            window.app_name = "${ config.app_name }";
          </script>
        `,
        name: config.app_name,
        body: body,
      });
    };
    return htmlTemplate;
  });
}

/**
 * Render component into the html template
 * @param Component : React component
 * @param props {Object}
 * @param context {Object}
 * @return {Promise} html string
 */
export function render(Component, props={}, context={}) {
  return getHtmlTemplate().then(template => {
    return template( React.renderToString(
      <ContextWrapper component={ Component } props={ props } context={ context } />
    ) );
  });
}
