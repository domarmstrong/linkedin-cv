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
   * Return the content of a file or directory
   *
   * @returns {Promise.<Object>}
   *
   * @Example:
   * (file)
   * ```
   * getFile('/foo/bar/file.js');
   * { file: "rendered file content" }
   * ```
   * (directory)
   * ```
   * getFile('/foo/bar');
   * { dir: {
   *   'file.js': '/foo/bar/file.js',
   *   'folder': '/foo/bar/folder',
   * }}
   * ```
   */
  getFile(fileId) {
    if (this.cache[fileId]) {
      return Promise.resolve(this.cache[fileId]);
    }

    let trimmedFileId = fileId.replace(/^\//, '');
    let file = null;
    let dir = {};
    let isFile = new RegExp('^' + trimmedFileId + '$');
    let folderPath = new RegExp('^' + trimmedFileId.replace(/^\//, '') + '/?');

    return this.getFileTree().then(tree => {
      for (var i = 0; i < tree.length; i++) {
        let filePath = tree[i];
        let relPath = filePath.replace(projectRoot, '');

        if (isFile.test(relPath)) {
          file = filePath;
          break;
        }

        if (folderPath.test(relPath)) {
          let trimmed = relPath.replace(folderPath, '');
          // is a directory
          if (trimmed.indexOf('/') !== -1) {
            let folder = trimmed.split('/')[0];
            if (! (folder in dir)) {
              dir[folder] = { type: 'folder', path: (trimmedFileId + '/' + folder).replace(/^\//, '') };
            }
          } else {
            dir[trimmed] = { type: 'file', path: relPath };
          }
        }
      }

      if (file) {
        return this.renderFile(file).then(rendered => {
          this.cache[fileId] = { file: rendered };
          return this.cache[fileId];
        });
      }

      if (! Object.keys(dir).length) {
        let err = new Error('Not found');
        err.status = 404;
        throw err;
      }

      this.cache[fileId] = { dir };
      return this.cache[fileId];
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
   * @param filepath {String} see full path to file
   * @return {Promise.<String>} highlightjs parsed code
   */
  renderFile(filepath) {
    let filetype = this.getFileType(filepath);
    return Qfs.read(filepath).then(file => {
      // Parse the file and cache the result
      return hljs.highlight(filetype, file, true).value;
    });
  }
}
