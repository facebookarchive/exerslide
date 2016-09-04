/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const expect = require('chai').expect;
const scaffolder = require('../scaffolder');
const testUtils = require('../../scripts/test-utils');
const path = require('path');

describe.only('scaffolder', () => {

  it('scaffolding files into the directory', done => {
    const dir = testUtils.makeDirectoryStructure({});

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            css: {},
            js: {},
            slides: {},
            'webpack.config.js': '',
            'exerslide.config.js': '',
            'package.json': '',
          }
        );
        done();
      }
    );
  });

  it('overwrites the initial JSON file', done => {
    const dir = testUtils.makeDirectoryStructure({
      'package.json': '{}',
    });

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            'package.json': content => {
              expect(content).to.not.contain('{}');
            },
          }
        );
        done();
      }
    );
  });

  it('preserves an existing package.json file', done => {
    const dir = testUtils.makeDirectoryStructure({
      'package.json': '{"foo": 42}',
    });

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            'package.json': '{"foo": 42}',
          }
        );
        done();
      }
    );
  });

  it('preserves existing files if confirm: false is set', done => {
    const dir = testUtils.makeDirectoryStructure({
      'exerslide.config.js': 'foo bar',
    });

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            'exerslide.config.js': 'foo bar',
          }
        );
        done();
      }
    );
  });

  it('overwrites existing files if overwriteAll: true is set', done => {
    const dir = testUtils.makeDirectoryStructure({
      'exerslide.config.js': 'foo bar',
    });

    scaffolder(
      dir,
      {name: 'test', overwriteAll: true},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            'exerslide.config.js': content => {
              expect(content).to.not.contain('foo bar');
            },
          }
        );
        done();
      }
    );
  });

});

