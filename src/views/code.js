"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { FileTree } from '../components/file_tree';
import request from '../request';

let cache = {};

export default class Code extends React.Component {

  static fetchProps (routerState) {
    let fileId = routerState.params.file;
    return Promise.all([
      request.getCached('/api/code-tree'),
      request.getCached('/api/code/' + fileId),
    ]).then(([ tree, code ]) => {
      return {
        tree: tree.body,
        code: code.text,
      }
    })
  }

  render () {
    let { tree, code, routerState } = this.props;

    // Because the file tree only knows the file ids, it does not know where they are
    // we add a urlPrefix so it can create correct links without hardcoding
    // eg: /location/of/code/FILE.foo
    // current file = FILE.foo
    // urlPrefix = /location/of/code
    let urlPrefix = routerState.location.pathname.replace('/' + routerState.params.file, '');

    return (
      <div id="code">
        <div className="file-browser">
          <h2>Files</h2>

          <FileTree data={ tree } urlPrefix={ urlPrefix } active={ routerState.params.file } />
        </div>

        <pre className="code-view">
          <code className="hljs" dangerouslySetInnerHTML={{__html: code }} />
        </pre>
      </div>
    )
  }
}
Code.propTypes = {
  tree: React.PropTypes.object.isRequired,
  code: React.PropTypes.string.isRequired,
};
