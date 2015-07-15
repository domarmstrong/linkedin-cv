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

  describe('getFile', () => {
    it('renders a file from its public identifier', async () => {
      let data = await code.getFile('README.md');
      assert.typeOf(data.file, 'string');
      assert.equal(data.dir, undefined);
    });

    it('returns the content of a directory', async () => {
      let data = await code.getFile('/src');
      assert.typeOf(data.dir, 'object');
      assert.equal(data.file, undefined);
    });

    it('caches result', async () => {
      let a = await code.getFile('/src');
      let b = await code.getFile('/src');
      assert.equal(a, b);
    });

    it('Does not return content of excluded files', () => {
      return code.getFile('/build/app.js').then(() => assert.fail()).catch(err => {
        assert.equal(err.message, 'Not found');
        assert.equal(err.status, 404);
      });
    });

    it('Does not return content of excluded folders', () => {
      return code.getFile('/build').then(() => assert.fail()).catch(err => {
        assert.equal(err.message, 'Not found');
        assert.equal(err.status, 404);
      });
    });

    it('Throws a 404 for bad file requests', () => {
      return code.getFile('/foobar').then(() => assert.fail()).catch(err => {
        assert.equal(err.message, 'Not found');
        assert.equal(err.status, 404);
      });
    });
  });
});
