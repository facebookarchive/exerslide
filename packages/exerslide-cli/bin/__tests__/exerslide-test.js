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
const path = require('path');
const testUtils = require('../../scripts/test-utils');

function run(args, cwd) {
  return new Promise((resolve, reject) => {
    childProcess.exec(
      [
        path.join(__dirname, '..', 'exerslide.js'),
      ]
      .concat(args).concat(['--EXERSLIDE_TEST']).join(' '),
      {cwd},
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Unexpected error: ${error.message}`));
          return;
        }
        resolve({stdout, stderr});
      }
    );
  });
}

function prepareWorkingDirectory(commands) {
  // Pretend that there is a exerslide installation there. The CLI should
  // call our command
  const cliModules = Object.keys(commands).reduce((obj, command) => {
    obj[command + '.js'] = 'exports.handler = ' + commands[command].toString();
    return obj;
  }, {});
  cliModules['index.js'] = [
    'module.exports = {',
    Object.keys(commands).map(c => `c: require("./${c}")`).join(','),
    '};',
  ].join('\n');

  return testUtils.makeDirectoryStructure({
    node_modules: {
      exerslide: {
        cli: cliModules,
        'index.js': '',
        'package.json': JSON.stringify({name: 'exerslide'}),
      },
    },
    'exerslide.config.js': '',
  });
}

describe('exerslide', () => {

  it('delegates to local commands', () => {
    const dir = prepareWorkingDirectory({
      test: () => console.log('called in test'), // eslint-disable-line no-console
    });
    return run(['test'], dir)
      .then(p => {
        expect(p.stdout).to.contain('called in test');
      });
  });

});




