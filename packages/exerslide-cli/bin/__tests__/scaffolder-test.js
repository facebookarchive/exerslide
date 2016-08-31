/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const childProcess = require('child_process');
const expect = require('chai').expect;
const fs = require('fs');
const globby = require('globby');
const makeDirectoryStructure = require('../../scripts/test-utils').makeDirectoryStructure;
const path = require('path');

const SCAFFOLDING_PATH = path.join(__dirname, '../../scaffolding');
const BIN_PATH = path.resolve(__dirname, '../../bin/exerslide.js');

function run(dir, extraArgs) {
  return childProcess.spawn(
    BIN_PATH,
    ['init'].concat(extraArgs || []),
    {cwd: dir}
  );
}

describe('exerslide', () => {

  describe('init', () => {

    it('copies the files from "scaffolding/" to the out dir', done => {
      const dir = makeDirectoryStructure({});
      const process = run(dir);

      process.on('close', () => {
        const targetDirFiles = globby.sync(path.join(dir, '**/*'));
        const scaffoldingFiles = globby.sync(path.join(SCAFFOLDING_PATH, '**/*'));

        expect(targetDirFiles).to.not.be.empty;
        expect(targetDirFiles.map(p => p.replace(dir, '')))
          .to.include.members(
            scaffoldingFiles.map(p => p.replace(SCAFFOLDING_PATH, ''))
          );
        done();
      });
    });

    it('does not copy slides folder if it already exists', done => {
      const dir = makeDirectoryStructure({slides: {}});
      const process = run(dir);

      process.on('close', () => {
        expect(globby.sync(path.join(dir, 'slides/*'))).to.be.empty;
        done();
      });
    });

    it('does not copy files that already exists', done => {
      const dir = makeDirectoryStructure({'package.json': 'foo'});
      const process = run(dir);
      let end = false;

      process.stdout.on('data', data => {
        if (!end && data.toString().includes('to do?')) {
          end = true;
          process.stdin.write('\n');
          process.stdin.end();
        }
      });
      process.on('close', () => {
        expect(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
          .to.equal('foo');
        done();
      });
    });

    it('copies files that already exists if --force is set', done => {
      const dir = makeDirectoryStructure({'package.json': 'foo'});
      const process = run(dir, ['--force']);

      process.on('close', () => {
        expect(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
          .to.not.equal('foo');
        done();
      });
    });

  });

});
