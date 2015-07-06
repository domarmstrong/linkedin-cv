"use strict";

import { assert } from 'chai';
import code from '../../src/server/code';

describe('code', () => {
  describe('getFileTree', () => {
    it('caches the lookup and returns the same tree on further calls', async () => {
      let a = await code.getFileTree();
      let b = await code.getFileTree();
      assert.equal(a, b);
    });
  });

  describe('getPrivateTree', () => {
    it('caches the lookup and returns the same tree on further calls', async () => {
      let a = await code.getPrivateTree();
      let b = await code.getPrivateTree();
      assert.equal(a, b);
    });
  });

  describe('getFileType', () => {
    it('returns less for .less', () => {
      assert.equal(code.getFileType('/foo/bar/baz.less'), 'less');
    });

    it('returns json for .json', () => {
      assert.equal(code.getFileType('/foo/bar/baz.json'), 'json');
    });

    it('returns markdown for .md', () => {
      assert.equal(code.getFileType('/foo/bar/baz.md'), 'markdown');
    });

    it('returns javascript for .js', () => {
      assert.equal(code.getFileType('/foo/bar/baz.js'), 'javascript');
    });

    it('returns text files with no extension', () => {
      assert.equal(code.getFileType('/foo/bar/baz'), 'text');
    });

    it('returns text files .txt', () => {
      assert.equal(code.getFileType('/foo/bar/baz.txt'), 'text');
    });

    it('throws when file type not recognised', () => {
      assert.throws(code.getFileType.bind(code, '/foo/bar/baz.ts'), 'Not implemented');
    });
  });

  describe('renderFile', () => {
    it('renders a file from its public identifier', async () => {
      let tree = await code.getPublicTree();
      let publicId = Object.keys(tree)[0];
      let rendered = await code.renderFile(publicId);
      assert.typeOf(rendered, 'string');
    });

    it('caches render', async () => {
      let tree = await code.getPublicTree();
      let publicId = Object.keys(tree)[0];
      let a = await code.renderFile(publicId);
      let b = await code.renderFile(publicId);
    });

    it('only allows rendering of public files by publicId', () => {
      return code.renderFile('build/app.js').then(() => assert.fail()).catch(err => {
        assert.equal(err.message, 'Access denied');
        assert.equal(err.status, 401);
      });
    });
  });
});
