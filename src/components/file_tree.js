"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

export class FileTree extends React.Component {
  render () {
    let { data, urlPrefix, active } = this.props;
    return (
        <div className="file-tree">
          <ul className="wrapper">
            <Folder name="Root" content={ data } urlPrefix={ urlPrefix } active={ active } />
          </ul>
        </div>
    );
  }
}
FileTree.propTypes = {
  data: React.PropTypes.object.isRequired,
  urlPrefix: React.PropTypes.string,
  active: React.PropTypes.string,
};

class Folder extends React.Component {
  render () {
    let { name, content, urlPrefix, active } = this.props;

    let items = Object.keys(content).map(key => {
      return { name: key, value: content[key] };
    }).sort((a, b) => {
      // Show folders before files
      if (typeof a.value === 'object') return -1;
      if (typeof b.value === 'object') return 1;
      return a.name > b.name ? 1 : -1
    }).map(item => {
      if (typeof item.value === 'string') {
        return <File key={ item.name } name={ item.name } value={ item.value } urlPrefix={ urlPrefix } active={ active } />;
      }
      return <Folder key={ item.name } name={ item.name } content={ item.value } urlPrefix={ urlPrefix } active={ active } />;
    });

    return (
      <li className="folder">
        <i className="icon-folder" />{ name }
        <ul>
          { items }
        </ul>
      </li>
    );
  }
}
Folder.propTypes = {
  name: React.PropTypes.string.isRequired,
  content: React.PropTypes.object.isRequired,
  urlPrefix: React.PropTypes.string,
  active: React.PropTypes.string,
};

class File extends React.Component {
  render () {
    let { name, value, urlPrefix, active } = this.props;
    let href = urlPrefix + '/' + value;
    let classes = classNames({
      'file': true,
      'active': active === value,
    });

    return (
      <li className={ classes }>
        <Link to={ href }>
          <i className="icon-file" />{ name }
        </Link>
      </li>
    );
  }
}
File.propTypes = {
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.string,
  urlPrefix: React.PropTypes.string,
  active: React.PropTypes.string,
};
