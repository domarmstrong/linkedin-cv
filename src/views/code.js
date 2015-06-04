"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import { FileTree } from '../components/file_tree';
import request from '../request';
import Promise from 'bluebird';

export default class Code extends React.Component {

  static fetchData (routerState) {
    let fileId = routerState.params.file;
    return Promise.all([
      request.get('/api/code-tree', { json: true }),
      request.get('/api/code/' + fileId),
    ]).then(([ tree, code ]) => {
      return { theCode: {
        tree: tree,
        code: code,
      }}
    })
  }

  render () {
    let { router, routeData } = this.context;
    let { tree, code } = routeData.theCode;
    let { params } = this.props;

    // Because the file tree only knows the file ids, it does not know where they are
    // we add a urlPrefix so it can create correct links without hardcoding
    // eg: /location/of/code/FILE.foo
    // current file = FILE.foo
    // urlPrefix = /location/of/code
    let urlPrefix = router.getCurrentPath().replace('/' + params.file, '');

    return (
      <div id="code">
        <div className="file-browser">
          <h2>Files</h2>

          <FileTree data={ tree } urlPrefix={ urlPrefix } active={ params.file } />
        </div>

        <pre className="code-view">
          <code className="hljs" dangerouslySetInnerHTML={{__html: code }} />
        </pre>
      </div>
    )
  }
}
Code.contextTypes = {
  router: React.PropTypes.any,
  routeData: React.PropTypes.object,
};
Code.propTypes = {
  code: React.PropTypes.string,
  fileTree: React.PropTypes.object,
  current_file: React.PropTypes.string,
};
