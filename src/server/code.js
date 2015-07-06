"use strict";

/**
 * Author: Dom Armstrong, Date: 22/05/15
 */

import hljs from 'highlight.js';
import Qfs from 'q-io/fs';
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
      'node_modules',
      'public'
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
      return Promise.resolve(this.cache['__filetree']);
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
   * Keep an internal reference to the files full path hashed against a unique id
   * Example:
   * ```
   * getPrivateTree();
   * > {
   *  id { filename: 'a.js', fullpath: '/home/user/project/folder/a.js', relfolderpath: ['folder'] },
   *  id { filename: 'b.js', fullpath: '/home/user/project/b.js', relfolderpath: [] },
   * }
   * ```
   * @returns {Promise.<Object>}
   */
  getPrivateTree () {
    if (this.cache['__privateTree']) {
      return Promise.resolve(this.cache['__privateTree']);
    }

    let privateTree = {};

    return this.getFileTree().then(paths => {
      paths.forEach(fullpath => {
        let relpath = fullpath.replace(projectRoot, '').split('/');
        let id = relpath.join('-');
        privateTree[ id ] = {
          filename: relpath.pop(),
          fullpath: fullpath,
          relfolderpath: relpath,
        };
      });
      // Cache the tree. To update restart the server
      this.cache['__privateTree'] = privateTree;
      return privateTree;
    });
  },

  /**
   * Get a file tree that can be used to display the file structure to the client
   * Example:
   * ```
   * getPublicTree();
   * > {
   *   file.js: id,
   *   folder: {
   *     file.js: id,
   *     folder: {}
   *   }
   * }
   * ```
   * @returns {Promise.<Array>}
   */
  getPublicTree () {
    let tree = {};

    function setNested (path, file, id) {
      var o = tree;  // a moving reference to internal objects within tree
      path.forEach(part => {
        if( !o[part] ) o[part] = {};
        o = o[part];
      });
      o[file] = id;
    }

    return this.getPrivateTree().then(tree => {
      Object.keys(tree).forEach(id => {
        var fileObject = tree[id];
        setNested(fileObject.relfolderpath, fileObject.filename, id);
      });
    }).then(() => tree);
  },

  /**
   * Get the filetype based on the files extension
   * defaults to 'text' if no extension found
   * @param filepath {String}
   * @returns {String}
   */
  getFileType (filepath) {
    let extension = /\.\w*$/.exec(filepath);
    if (! extension) {
      return 'text';
    }

    switch (extension[0]) {
      case '.less':
        return 'less';
      case '.json':
        return 'json';
      case '.md':
        return 'markdown';
      case '.js':
        return 'javascript';
      case '.txt':
        return 'text';
      default:
        throw new Error('Not implemented');
    }
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
   * @param fileId {String} see getPublicTree/getPrivateTree
   * @return {Promise.<String>} highlightjs parsed code
   */
  renderFile(fileId) {
    if (this.cache[fileId]) {
      return Promise.resolve(this.cache[fileId]);
    }
    return this.getPrivateTree().then(tree => {
      if (! (fileId in tree)) {
        let err = new Error('Access denied');
        err.status = 401;
        throw err;
      }
      let filepath = tree[fileId].fullpath;
      let filetype = this.getFileType(filepath);
      return Qfs.read(filepath).then(file => {
        // Parse the file and cache the result
        let parsed = hljs.highlight(filetype, file, true).value;
        this.cache[fileId] = parsed;
        return parsed;
      });
    });
  }
}
