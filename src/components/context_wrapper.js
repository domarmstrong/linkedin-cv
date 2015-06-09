"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 *
 * Wrapper component used for passing context to children
 */

import React from 'react';

export class ContextWrapper extends React.Component {
  getChildContext () {
    return this.props.context;
  }
  render () {
    return <this.props.component { ...this.props.props } />
  }
}
ContextWrapper.props = {
  props: React.PropTypes.object,
  context: React.PropTypes.object.isRequired,
  component: React.PropTypes.element.isRequired,
};
ContextWrapper.childContextTypes = {
  routeData: React.PropTypes.object,
};
