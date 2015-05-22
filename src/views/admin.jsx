"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';

export class Admin extends React.Component {
  render () {
    return (
      <Layout id="admin">
        Admin
        <form className="pure-form" action="/admin/update" method="GET">
          <button type="submit" className="pure-button pure-button-primary">Update profile</button>
        </form>
      </Layout>
    )
  }
}
