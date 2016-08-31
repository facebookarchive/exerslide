/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This command is similar to the global `exerslide init` command. The
 * difference is that this one won't try to install exerslide, because it can
 * only be run when it is already installed.
 *
 * The global `exerslide init` command delegates to this local `exerslide init`
 * command.
 */

'use strict';

exports.command = 'init [name]';
exports.builder = {};
exports.describe = 'copies the default files and installs required dependencies. See also "copy-defaults"';
exports.handler = function(argv) {
  const utils = require('./utils');
  copyFiles(argv)
    .then(installDependencies)
    .catch(error => {
      utils.logError(`An unexpected error occured: "${error.message}"`);
    });
};

function copyFiles(argv) {
  const scaffolder = require('../lib/scaffolder');

  return new Promise((resolve, reject) => {
    scaffolder(process.cwd(), argv, error => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

function installDependencies() {
  const childProcess = require('child_process');
  const utils = require('./utils');

  return new Promise((resolve, reject) => {
    utils.log('Installing dependencies (`npm install`)...');
    const npm = childProcess.spawn(
      'npm',
      ['install'],
      {
        stdio: 'inherit',
      }
    );

    npm.on('exit', code => {
      if (code === 0) {
        utils.log(
          'Everything is good to go! Use `exerslide [build|watch|serve]` ' +
          'to build the presentation.'
        );
        resolve();
      } else {
        reject(new Error(
          'There seems to be a problem with installing the dependcies. ' +
          'Check the output of `npm install` above, fix any problems and try ' +
          'running `npm install` yourself.'
        ));
      }
    });
  });
}
