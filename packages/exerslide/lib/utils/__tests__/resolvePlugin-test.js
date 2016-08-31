/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const expect = require('chai').expect;
const makeDirectoryStructure = require('../../../scripts/test-utils').makeDirectoryStructure;
const path = require('path');
const resolvePlugin = require('../resolvePlugin');

describe('resolvePlugin', () => {

  it('resolves "exerslide" no matter the context', () => {
    expect(resolvePlugin('exerslide', '')).to.deep.equal({
      name: 'exerslide',
      path: path.resolve(__dirname, '../../../'),
    });
  });

  it('resolves "." or "./" to the context', () => {
    expect(resolvePlugin('.', '/foo')).to.deep.equal({
      name: '.',
      path: '/foo',
    });
    expect(resolvePlugin('./', '/foo')).to.deep.equal({
      name: '.',
      path: '/foo',
    });
  });

  it('resolves local paths', () => {
    expect(resolvePlugin('../../../', __dirname)).to.deep.equal({
      name: 'exerslide',
      path: path.resolve(__dirname, '../../../'),
    });
  });

  it('resolves module names', () => {
    expect(resolvePlugin('chai', __dirname)).to.deep.equal({
      name: 'chai',
      path: path.dirname(require.resolve('chai/package.json')),
    });
  });

  it('prepends "exerslide-plugin-" if it cannot find the module', () => {
    const dir = makeDirectoryStructure({
      node_modules: {
        plugin1: {
          'package.json': '{"name": "plugin1"}',
        },
        'exerslide-plugin-plugin1': {
          'package.json': '{"name": "exerlside-plugin-plugin1"}',
        },
        'exerslide-plugin-plugin2': {
          'package.json': '{"name": "exerlside-plugin-plugin2"}',
        },
      },
    });

    expect(resolvePlugin('plugin1', dir)).to.deep.equal({
      name: 'plugin1',
      path: path.resolve(dir, 'node_modules/plugin1/'),
    });
    expect(resolvePlugin('plugin2', dir)).to.deep.equal({
      name: 'plugin2',
      path: path.resolve(dir, 'node_modules/exerslide-plugin-plugin2/'),
    });
  });

});
