"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import request from '../request';

let cache = {};

export default class Contact extends React.Component {

  static _fetchProps () {
    return request.getCached('/api/contact-details').then(res => res.body);
  }

  render () {
    let { contact } = this.props;

    return (
      <div id="contact" className="single-col">
        <h1>Get in touch</h1>

        <ul>
          <li>Email ()</li>
          <li>Mobile ()</li>
          <li>Phone ()</li>
        </ul>
      </div>
    )
  }
}
Contact.propTypes = {
  email: React.PropTypes.string,
  phone: React.PropTypes.string,
  mobile: React.PropTypes.string,
  github: React.PropTypes.string,
};
