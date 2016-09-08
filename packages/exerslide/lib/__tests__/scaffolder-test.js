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
        const targetDirFiles = globby.sync(path.join(dir, '**/*'))
          .map(p => p.replace(dir, ''));
        const scaffoldingFiles =
          globby.sync(path.join(SCAFFOLDING_PATH, '**/*'))
            .filter(p => p.indexOf('__tests__') === -1)
            .map(p => p.replace(/style\.css$/, 'test.css')
                       .replace(SCAFFOLDING_PATH, '')
            );

        expect(targetDirFiles).to.not.be.empty;
        expect(targetDirFiles).to.include.members(scaffoldingFiles);
        expect(scaffoldingFiles).to.include.members(targetDirFiles);
        done();
      }
    );
  });

  it('does not copy tests', done => {
    const dir = testUtils.makeDirectoryStructure({});

    scaffolder(
      dir,
      {name: 'test', confirm: false},
      function() {
        const targetDirFiles = globby.sync(path.join(dir, '**/*'));
        expect(targetDirFiles.filter(p => p.indexOf('__tests__') > -1))
          .to.have.length(0);
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

  it('uses the "name" option for the custom CSS file and injects it', done => {
    const dir = testUtils.makeDirectoryStructure({});

    scaffolder(
      dir,
      {name: 'myProject', confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            css: {
              'myProject.css': '',
            },
            'package.json': content => {
              expect(content).to.contain('"name": "myProject"');
            },
            'index.html': content => {
              expect(content).to.contain('<title>myProject</title>');
            },
          }
        );
        done();
      }
    );
  });

  it('uses the name in package.json if none is passed', done => {
    const dir = testUtils.makeDirectoryStructure({
      'package.json': JSON.stringify({name: 'packageNameTest'}),
    });

    scaffolder(
      dir,
      {confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            css: {
              'packageNameTest.css': '',
            },
            'index.html': content => {
              expect(content).to.contain('<title>packageNameTest</title>');
            },
          }
        );
        done();
      }
    );
  });

  it('uses the name of the current working directory', done => {
    const dir = testUtils.makeDirectoryStructure({
      'package.json': JSON.stringify({name: ''}),
    });
    const name = path.basename(dir);
    const css = {};
    css[name + '.css'] = '';

    scaffolder(
      dir,
      {confirm: false},
      function() {
        testUtils.validateFolderStructure(
          dir,
          {
            css,
            'index.html': content => {
              expect(content).to.contain(`<title>${name}</title>`);
            },
          }
        );
        done();
      }
    );
  });

});

