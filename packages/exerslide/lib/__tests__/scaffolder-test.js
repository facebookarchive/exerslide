/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const expect = require('chai').expect;
const globby = require('globby');
const path = require('path');
const scaffolder = require('../scaffolder');
const testUtils = require('../../scripts/test-utils');

const SCAFFOLDING_PATH = path.resolve(__dirname, '../../scaffolding/');

describe('scaffolder', () => {

  it('copies the files from "scaffolding/" to the out dir', done => {
    const dir = testUtils.makeDirectoryStructure({});

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        const targetDirFiles = globby.sync(path.join(dir, '**/*'));
        const scaffoldingFiles =
          globby.sync(path.join(SCAFFOLDING_PATH, '**/*'))
          .map(x => x.replace(/style\.css$/, 'test.css'));

        expect(targetDirFiles).to.not.be.empty;
        expect(targetDirFiles.map(p => p.replace(dir, '')))
          .to.include.members(
          scaffoldingFiles.map(p => p.replace(SCAFFOLDING_PATH, ''))
        );
        done();
      }
    );
  });

  it('does not copy slides folder if it already exists', done => {
    const dir = testUtils.makeDirectoryStructure({
      slides: {},
      'exerslide.config.js': '',
    });

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        expect(globby.sync(path.join(dir, 'slides/*'))).to.be.empty;
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

