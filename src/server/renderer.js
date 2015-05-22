"use strict";

import Q from 'q';
import Qfs from 'q-io/fs';
import React from 'react';
import _ from 'underscore';
import path from 'path';
import util from 'util';

const config = require(path.join(process.cwd(), 'config.js'));

/**
 * Get the compiled html template page and cache it
 * @return {String} html
 */
let htmlTemplate = '';
function getHtmlTemplate() {
  // Return cached version
  if (htmlTemplate) {
    return Q(htmlTemplate);
  }

  return Qfs.read(path.join(__dirname, '../../', '/public/index.html')).then(html => {
    // Compile to underscore template and return a partial function
    // which only requires the body html string to be passed
    htmlTemplate =  function (body) {
      return _.template(html)({
        name: config.app_name,
        body: body,
      });
    };
    return htmlTemplate;
  });
}

/**
 * Get context extended with global context that all components can access
 * @return (Object)
 */
function getContext(context) {
  return util._extend({
    app_name: config.app_name,
  }, context);
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
      <Container component={ Component } props={ props } context={ getContext(context) } />
    ) );
  });
}

/**
 * Wrapper component used for passing context to children
 */
class Container extends React.Component {
  getChildContext () {
    return this.props.context;
  }
  render () {
    return <this.props.component { ...this.props.props } />
  }
}
Container.childContextTypes = {
  app_name: React.PropTypes.string.isRequired,
  active_route: React.PropTypes.string.isRequired,
};
