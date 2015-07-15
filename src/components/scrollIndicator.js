"use strict";

/**
 * Author: Dom Armstrong, Date: 15/07/15
 */

import React from 'react';
import classNames from 'classnames';
import autobind from 'autobind-decorator';

export class ScrollIndicator extends React.Component {

  componentDidMount () {
    this.updateScrollIndicators();
  }

  componentDidUpdate () {
    this.updateScrollIndicators();
  }

  /**
   * Display is there is scrolling up or down available
   */
  updateScrollIndicators () {
    let container = this.refs.container;
    let up = false;
    let down = false;
    let scrollTop = container.scrollTop;
    let scrollHeight = container.scrollHeight;
    let offsetHeight = container.offsetHeight;

    if (scrollTop > 0) {
      up = true;
    }

    if (
      scrollHeight > offsetHeight && scrollTop + offsetHeight !== scrollHeight
    ) {
      down = true;
    }

    container.className = classNames('scroll-indicator', this.props.className, {
      'scroll-up': up,
      'scroll-down': down,
    });
  }

  @autobind
  handleScroll () {
    this.updateScrollIndicators();
  }

  render () {
    return (
      <div ref="container" onScroll={ this.handleScroll }>
          { this.props.children }
      </div>
    )
  }
}
ScrollIndicator.propTypes = {
  className: React.PropTypes.string,
};

