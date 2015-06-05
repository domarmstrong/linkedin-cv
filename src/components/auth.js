"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import request from '../request';

/**
 * This component is a simple mixin for use with react-router handlers
 * if the user is not authenticated they will be redirected to /login
 * the login page will get a query of `?then=/where-i-wanted-to-go`
 */
class Component extends React.Component {
  static willTransitionTo(transition, params, query, router) {
    console.log('transistion', transition, params, query);
    if (! transition.context.auth.isAuthenticated()) {
      transition.redirect('/login', {}, { then : transition.path });
    }
  }
}

export default {
  Component,
}
