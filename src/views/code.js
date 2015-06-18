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

  /**
   * Because the file tree only knows the file ids, it does not know where they are
   * we add a urlPrefix so it can createDOM correct links without hardcoding
   * eg: /location/of/code/FILE.foo
   * current file = FILE.foo
   * urlPrefix = /location/of/code
   *
   * @returns {string}
   */
  getUrlPrefix () {
    let { routerState } = this.props;
    return routerState.location.pathname.replace('/' + routerState.params.file, '');
  }

  render () {
    let { tree, code, routerState } = this.props;

    return (
      <div id="code">
        <div className="file-browser">
          <h2>Files</h2>

          <FileTree data={ tree } urlPrefix={ this.getUrlPrefix() } active={ routerState.params.file } />
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
  routerState: React.PropTypes.object.isRequired,
};
