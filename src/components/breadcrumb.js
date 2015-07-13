"use strict";

/**
 * Author: Dom Armstrong, Date: 13/07/15
 */

import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

export class Breadcrumb extends React.Component {
  /**
   * Split a url into parts
   *
   * @example
   * ```
   * getUrlParts('/foo/bar/baz');
   * [
   *   { url: '/foo', name: 'foo' },
   *   { url: '/foo/bar', name: 'bar' },
   *   { url: '/foo/bar/baz', name: 'baz' },
   * ]
   * ```
   */
  static getUrlParts (url) {
    let path = '';
    return url.split('/').filter(part => part).map(part => {
      path += `/${part}`;
      return { url: path, name: part };
    });
  }

  static renderLink (part, current) {
    let text = <span className="text">{ part.name }</span>;
    return (
      <li key={ part.url } className="breadcrumb">
        { current ? (
          <div className="current">{ text }</div>
        ) : (
          <Link to={ part.url }>{ text }</Link>
        )}
      </li>
    );
  }

  render () {
    let { url } = this.props;
    let urlParts = Breadcrumb.getUrlParts(url);
    let links = urlParts.map((part, i) => {
      let current = false;
      if (i === urlParts.length -1) current = true;
      return Breadcrumb.renderLink(part, current);
    });

    return (
      <div className="breadcrumbs">
        <ul className="wrapper">
          { links }
        </ul>
      </div>
    );
  }
}
Breadcrumb.propTypes = {
  url: React.PropTypes.string.isRequired,
};
