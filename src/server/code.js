"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import hljs from 'highlight.js';
import Qfs from 'q-io/fs';
import Q from 'q';
import path from 'path';
import debug from 'debug';

const d = debug('linkedIn-cv:code');
const projectRoot = path.join(__dirname, '../../');

export default {
  /**
   * Cache parsed files in memory
   */
  cache: {},

  config: {
    ignore: [
      '.idea',
      '.agignore',
      '.gitignore',
      '.git',
      'config.js',
      'build',
      'node_modules'
    ].map(function (p) { return path.join(projectRoot, p); }),
  },

  /**
   * Get a flat array with the folder structure excluding
   * files/directories in config.ignore
   * @returns {Promise.<Array>}
   */
  getFileTree () {
    let config = this.config;
    if (this.cache['__filetree']) {
      return Q(this.cache['__filetree']);
    }
    return Qfs.listTree(projectRoot, (path, stat) => {
      // do not return or traverse into ignores paths
      if (config.ignore.indexOf(path) !== -1) return null;
      // do not return directories on their own
      return ! stat.isDirectory();
    }).then(paths => {
      this.cache['__filetree'] = paths;
      return paths;
    });
  },

  /**
   * Get a file tree that can be used to display the file structure
   * Example:
   * ```
   * getPublicTree();
   * > {
   *   file.js: null,
   *   folder: {
   *     file.js: null,
   *     folder: {}
   *   }
   * }
   * ```
   * @returns {Promise.<Array>}
   */
  getPublicTree () {
    let tree = {};

    return this.getFileTree().then(paths => {
      paths.map(path => {
          // remove the project path so not made public
          return path.replace(projectRoot, '')
            .split('/');
        })
        // sort so top level files and folders are first
        .sort((a, b) => a.length > b.length ? 1 : -1)
        .forEach(path => {
          let file = path.pop();
          this._setNested(tree, path, file);
        });
    }).then(() => tree);
  },

  _setNested (tree, path, file) {
    var o = tree;  // a moving reference to internal objects within tree
    path.forEach(part => {
      if( !o[part] ) o[part] = {};
      o = o[part];
    });
    o[file] = null;
  },

  /**
   * Only allow rendering of files that are returned from `getFileTree`
   * @param filepath
   * @returns {Promise}
   * @throws Access denied error
   */
  canView (filepath) {
    return this.getFileTree().then(paths => {
      if (paths.indexOf(filepath) === -1) {
        d('Error: access denied for file: ', filepath);
        throw new Error(401);
      }
    });
  },

  /**
   * Render the file using highlightjs
   * Example:
   * ```
   * function () {}
   * ```
   * ```
   * <span class="hljs-function">
   *   <span class="hljs-keyword">function</span>
   *   ...
   * </span>
   * ```
   * Requires extra css file to be included to view
   * see https://highlightjs.org
   *
   * @param filepath
   * @return {Promise.<String>} highlightjs parsed code
   */
  renderFile(filepath) {
    console.log(filepath);
    if (this.cache[filepath]) {
      return Q(this.cache[filepath]);
    }
    return this.canView(filepath).then(() => {
      return Qfs.read(filepath).then(file => {
        return hljs.highlight('javascript', file, true).value;
      });
    });
  }
}