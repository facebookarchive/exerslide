/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const expect = require('chai').expect;
const fileLookupHelper = require('../fileLookupHelper');
const path = require('path');
const testUtils = require('../../../scripts/test-utils');

describe('fileLookupHelper', () => {

  it('lists all files in the provided directory', () => {
    const dir = testUtils.makeDirectoryStructure({
      node_modules: {
        plugin1: {
          dir1: {
            file1: '',
            dir2: {
              file2: '',
            },
            __file3__: '',
            'file-04': '',
            'file5.js': '',

          },
          file1: '',
          'package.json': JSON.stringify({name: 'plugin1'}),
        },
      },
    });

    const modulePath = path.resolve(
      __dirname,
      path.join(dir, 'node_modules', 'plugin1')
    );

    expect(fileLookupHelper.listFilesFromPlugins(
      ['plugin1'],
      'dir1',
      path.resolve(__dirname, dir)
    ))
      .to.deep.equal({
        plugin1: {
          file1: path.join(modulePath, 'dir1', 'file1'),
          __file3__: path.join(modulePath, 'dir1', '__file3__'),
          'file-04': path.join(modulePath, 'dir1', 'file-04'),
          file5: path.join(modulePath, 'dir1', 'file5.js'),
        },
      });
  });

});

