"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';

export class Code extends React.Component {
  render () {
    return (
      <Layout id="code">
        <h1>The code</h1>

        <pre>
          <code className="hljs" dangerouslySetInnerHTML={{__html: this.props.code }} />
        </pre>
      </Layout>
    )
  }
}
