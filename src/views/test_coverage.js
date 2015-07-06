"use strict";

/**
 * Author: Dom Armstrong, Date: 31/05/15
 *
 * Istanbul coverage report is generated as a static site so in order to embed
 * within the site it is displayed in an iframe.
 *
 * All links in the report get hijacked in order to change the browsers url and make
 * the links persistent. If javascript is disabled all links will work but the browser will
 * not update its url and a refresh will reload on the index of the report.
 */

import React from 'react';
import autobind from 'autobind-decorator';
import path from 'path';
import { toAbsoluteUrl } from '../../src/request';


export default class TestCoverage extends React.Component {

  componentDidMount () {
    if (this.props.testContent) {
      this.injectContent();
    }
    this.hijackLinks();
  }

  /**
   * Inject content into the iframe to allow testing
   */
  injectContent () {
    let frame = this.refs.frame;
    let document = frame.contentDocument;
    document.open();
    document.write(this.props.testContent);
    document.close();
  }

  /**
   * Hijack all links in the iframe by adding an event listener to each.
   * Note: not using document.addEventListener due to dodgy behaviour
   */
  @autobind
  hijackLinks () {
    let frame = this.refs.frame;
    let window = frame.contentWindow;
    if (window.document.documentElement === null) return; // document is not loaded properly (jsdom)
    let nodes = window.document.querySelectorAll('a');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener('click', this.linkListener, false);
    }
  }

  /**
   * On click of a link stop the default action and route using react-router
   * @param event
   */
  @autobind
  linkListener (event) {
    let target = event.target;
    if (target.nodeName === 'A') {
      let href = target.getAttribute('href');

      // Only route internal urls
      if (/(http|https):\/\//.test(href)) return;

      // getPath() > foo/bar/baz.html > foo/bar
      let currentWithoutFile = this.getPath().split('/').slice(0, -1).join('/');
      // join link > foo/bar/qux/link.html
      let goTo = path.join(currentWithoutFile, href);

      // The main index is handled by the indexRoute
      if (/^\/?index\.html/.test(goTo)) {
        goTo = '';
      }

      // join to basePath and remove trailing "/"
      goTo = path.join(this.getBasePath() + goTo).replace(/\/$/, '');

      this.context.router.transitionTo(goTo);
      event.preventDefault();
    }
  }

  /**
   * @returns {String}
   */
  getPath () {
    let params = this.props.routerState.params;
    let path = '';
    if (params.splat) {
      if (Array.isArray(params.splat)) {
        path += params.splat.join('/');
      } else {
        path += params.splat;
      }
    }
    if (path.startsWith('/')) path = path.slice(1);
    return path;
  }

  /**
   * @returns {String}
   */
  getBasePath () {
    let pathname = this.props.routerState.location.pathname;
    let path = pathname.replace(this.getPath(), '');
    if (! path.endsWith('/')) path += '/';
    return path;
  }

  render () {
    let testContent = this.props.testContent;
    let src = testContent ? 'blank' : toAbsoluteUrl('/public/coverage/' + this.getPath());
    return (
      <div id="test-coverage">
        <iframe key={ src } ref="frame" className="test-coverage" src={ src } onLoad={ this.hijackLinks } />
      </div>
    )
  }
}
TestCoverage.contextTypes = {
  router: React.PropTypes.any.isRequired,
  testContent: React.PropTypes.string,
};
