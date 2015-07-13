"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

export class PageMenu extends React.Component {

  render () {
    let props = this.props;

    return (
        <div className="page-menu">
          <div className="wrapper">
            <a className="menu-heading" href="/">{ props.app_name }</a>

            <ul className="menu-list">
              <MenuItem href="/cv" icon="icon-profile" { ...props }>Curriculum Vitae</MenuItem>
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
  /**
   * Is this the active route
   * @returns {boolean}
   */
  isActive () {
    let { href, active_route } = this.props;

    if (href === '/') {
      // special case or it will match everything
      return active_route === '/';
    } else {
      // any route that starts with this href will be matched
      return new RegExp('^' + href).test(active_route);
    }
  }

  render () {
    let { href, icon } = this.props;

    return (
      <li className={ classNames('menu-item', { 'active': this.isActive() }) }>
        <Link to={ href }>
          <i className={ icon } />{ this.props.children }
        </Link>
      </li>
    );
  }
}
MenuItem.propTypes = {
  href: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
  active_route: React.PropTypes.string.isRequired,
};
