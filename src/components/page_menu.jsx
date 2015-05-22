"use strict";
/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import classNames from 'classnames';

export class PageMenu extends React.Component {
  render () {
    return (
        <div className="page-menu">
          <div className="wrapper">
            <a className="menu-heading" href="/">{ this.context.app_name }</a>

            <ul className="menu-list">
              <MenuItem href="/" icon="icon-profile">Curriculum Vitae</MenuItem>
              <MenuItem href="/the-code" icon="icon-code">Look inside</MenuItem>
              <MenuItem href="/contact" icon="icon-phone">Contact</MenuItem>
            </ul>
            <ul className="menu-footer menu-list">
              <MenuItem href="/admin" icon="icon-settings">Admin</MenuItem>
            </ul>
          </div>
        </div>
    )
  }
}
PageMenu.contextTypes = {
  app_name: React.PropTypes.string,
};

class MenuItem extends React.Component {
  render () {
    let { href, icon } = this.props;

    let classes = classNames({
      'menu-item': true,
      'active': this.context.active_route === href,
    });

    return (
      <li className={ classes }>
        <a href={ href }>
          <i className={ icon } />{ this.props.children }
        </a>
      </li>
    );
  }
}
MenuItem.contextTypes = {
  active_route: React.PropTypes.string,
};
MenuItem.propTypes = {
  href: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
};
