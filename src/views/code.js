"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { FileTree } from '../components/file_tree';

export default class Code extends React.Component {
  render () {
    return (
      <div id="code">
        <div className="file-browser">
          <h2>Files</h2>

          <FileTree data={ this.props.fileTree } urlPrefix={ this.context.active_route } active={ this.props.current_file } />
        </div>

        <pre className="code-view">
          <code className="hljs" dangerouslySetInnerHTML={{__html: this.props.code }} />
        </pre>
      </div>
    )
  }
}
Code.contextTypes = {
  active_route: React.PropTypes.string,
};
Code.propTypes = {
  code: React.PropTypes.string,
  fileTree: React.PropTypes.object,
  current_file: React.PropTypes.string,
};
