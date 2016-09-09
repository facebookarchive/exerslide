/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const testUtils = require('../../scripts/test-utils');

function run(args, cwd) {
  return new Promise((resolve, reject) => {
    childProcess.exec(
      [
        path.join(__dirname, 'test-cli.js'),
        'init',
      ]
      .concat(args).concat('--EXERSLIDE_TEST').join(' '),
      {cwd},
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({stdout, stderr});
      }
    );
  });
}

function prepareWorkingDirectory(dir) {
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.symlinkSync(
    path.join(__dirname, '..', '..'),
    path.join(dir, 'node_modules', 'exerslide')
  );
}

describe('exerslide init', () => {

  it('passes "name" to the scaffolder', () => {
    // Prepare directory
    // It needs to have exerslide linked in, otherwise it will try to install it
    // which we don't want.
    const dir = testUtils.makeDirectoryStructure({});
    prepareWorkingDirectory(dir);
    return run(['foo'], dir)
      .then(() => {
        testUtils.validateFolderStructure(
          dir,
          {
            'css': {
              'foo.css': '',
            },
          }
        );
      });
  });

});



