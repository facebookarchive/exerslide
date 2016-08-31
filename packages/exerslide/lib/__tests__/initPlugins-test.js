/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const initPlugins = require('../initPlugins');
const expect = require('chai').expect;
const makeDirectoryStructure = require('../../scripts/test-utils').makeDirectoryStructure;

global.expect = expect;

const dir = makeDirectoryStructure({
  node_modules: {
    plugin1: {
      contentTypes: {
        'myType.js': '',
      },
      layouts: {
        'myLayout.js': '',
      },
      'package.json': '{"name": "plugin1"}',
    },
    'exerslide-plugin-plugin2': {
      'package.json': '{"name": "plugin2"}',
      'init.js': `
        module.exports = function(exerslideConfig, webpackConfig) {
          expect(exerslideConfig, 'plugin.init[exerslideConfig]').to.not.be.undefined;
          expect(webpackConfig, 'plugin.init[webpackConfig]').to.not.be.undefined;
          expect(exerslideConfig).to.not.equal(webpackConfig);
        };
      `,
    },
  },
});

describe('initPlugins', () => {

  it('initializes plugins', () => {
    initPlugins(
      {plugins: ['plugin2']},
      {context: dir, slideLoader: {transforms: []}}
    );
  });

});
