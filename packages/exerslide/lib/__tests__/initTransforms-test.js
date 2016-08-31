/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const initTransforms = require('../initTransforms');
const expect = require('chai').expect;
const makeDirectoryStructure = require('../../scripts/test-utils').makeDirectoryStructure;
const path = require('path');
const slideLoader = require('../slide-loader');

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
  },
});

function test(exerslideConfig, webpackConfig, content, verify) {
  webpackConfig = Object.assign(
    {
      context: dir,
      slideLoader: {
        transforms: [],
      },
    },
    webpackConfig
  );

  initTransforms(exerslideConfig, webpackConfig);
  slideLoader.call(
    {
      resourcePath: 'test.md',
      options: webpackConfig,
      async: () =>  (
        (error, result) => verify(error, result.replace(/\n+\s*/g, ''))
      ),
      emitWarning: () => {},
    },
    content
  );
}

describe('initTransforms', () => {

  it('properly initializes default transforms', done => {
    test(
      {plugins: ['plugin1']},
      {},
      '---\n layout: myLayout\ncontent_type: myType\n---\n',
      (error, result) => {
        expect(result).to.contain(path.join(dir, 'node_modules/plugin1/contentTypes/myType.js'));
        expect(result).to.contain(path.join(dir, 'node_modules/plugin1/layouts/myLayout.js'));
        done();
      }
    );
  });

});
