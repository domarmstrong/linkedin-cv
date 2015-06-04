"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import classNames from 'classnames';

export class PageMenu extends React.Component {

  render () {
    let props = this.props;

    return (
        <div className="page-menu">
          <div className="wrapper">
            <a className="menu-heading" href="/">{ props.app_name }</a>

            <ul className="menu-list">
              <MenuItem href="/" icon="icon-profile" { ...props }>Curriculum Vitae</MenuItem>
              <MenuItem href="/the-code" icon="icon-code" { ...props }>Look inside</MenuItem>
              <MenuItem href="/contact" icon="icon-phone" { ...props }>Contact</MenuItem>
            </ul>
            <ul className="menu-footer menu-list">
              <MenuItem href="/admin" icon="icon-settings" { ...props }>Admin</MenuItem>
            </ul>
          </div>
        </div>
    )
  }
}
PageMenu.propTypes = {
  app_name: React.PropTypes.string.isRequired,
  active_route: React.PropTypes.string.isRequired,
};

class MenuItem extends React.Component {
  render () {
    let { href, icon, active_route } = this.props;

    return (
      <li className={ classNames('menu-item', { 'active': active_route === href }) }>
        <a href={ href }>
          <i className={ icon } />{ this.props.children }
        </a>
      </li>
    );
  }
}
MenuItem.propTypes = {
  href: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
  active_route: React.PropTypes.string.isRequired,
};
