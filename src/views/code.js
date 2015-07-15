"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import request from '../request';
import { Link } from 'react-router';

let cache = {};

export default class Code extends React.Component {

  static fetchProps (routerState) {
    let splat = routerState.params.splat;
    return request.getCached('/api/code' + splat).then(res => res.body);
  }

  static getBackPath (routerState) {
    if (! routerState.params.splat) {
      return null;
    }
    return routerState.location.pathname.split('/').slice(0, -1).join('/');
  }

  render () {
    let { file, dir, routerState } = this.props;
    let back =  Code.getBackPath(routerState);

    return (
      <div id="code">
        { back && <div className="back"><Link to={ back }><i className="icon-arrow-back" /></Link></div> }
        { file ? <FileView code={ file } /> : <DirectoryView dir={ dir } routerState={ routerState } /> }
      </div>
    )
  }
}
Code.propTypes = {
  file: React.PropTypes.string,
  dir: React.PropTypes.object,
  routerState: React.PropTypes.object.isRequired,
};

class FileView extends React.Component {
  render () {
    return (
      <pre className="code-view">
        <code className="hljs" dangerouslySetInnerHTML={{__html: this.props.code }} />
      </pre>
    );
  }
}
FileView.propTypes = {
  code: React.PropTypes.string.isRequired,
};

export class DirectoryView extends React.Component {
  renderContent () {
    let dir = this.props.dir;

    return Object.keys(dir).sort((a, b) => {
      // show folders first then files, order alphabetically
      let aType = dir[a].type;
      let bType = dir[b].type;
      if (aType === 'folder' && bType !== 'folder') return -1;
      if (aType !== 'folder' && bType === 'folder') return 1;
      return a > b ? 1 : -1;
    }).map(key => {
      let item = dir[key];
      return (
        <li key={ key } className={ item.type }>
          <Link to={ this.getUrlPrefix() + '/' + item.path }>
            <i className={ item.type === 'file' ? 'icon-file' : 'icon-folder' } />
            { key }
          </Link>
        </li>
      );
    });
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
    return routerState.location.pathname.replace(routerState.params.splat, '');
  }

  render () {
    return (
      <div className="directory-view">
        <ul className="dir">
          { this.renderContent() }
        </ul>
      </div>
    );
  }
}
DirectoryView.propTypes = {
  dir: React.PropTypes.object.isRequired,
  routerState: React.PropTypes.object.isRequired,
};
