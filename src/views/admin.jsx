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
        <h1>Admin</h1>

        <form action="/logout" method="GET">
          <button type="submit">Logout</button>
        </form>

        <form action="/admin/update" method="GET">
          <button type="submit">Update profile</button>
        </form>
      </Layout>
    )
  }
}
