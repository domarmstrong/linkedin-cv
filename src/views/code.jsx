"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { Layout } from '../components/layout';
import { FileTree } from '../components/file_tree';

export class Code extends React.Component {
  render () {
    return (
      <Layout id="code">
        <h1>The code</h1>

        <FileTree data={ this.props.fileTree } urlPrefix={ this.context.active_route } />

        <pre>
          <code className="hljs" dangerouslySetInnerHTML={{__html: this.props.code }} />
        </pre>
      </Layout>
    )
  }
}
Code.contextTypes = {
  active_route: React.PropTypes.string,
};
