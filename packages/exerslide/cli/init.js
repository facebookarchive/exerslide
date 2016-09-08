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
exports.builder = {
  verbose: {
    alias: ['v'],
    boolean: true,
    describe: 'Show the `npm install` output.',
    default: false,
  },
};
exports.describe = 'copies the default files and installs required dependencies. See also "copy-defaults"';
exports.handler = function(argv) {
  const utils = require('./utils');
  copyFiles(argv)
    .then(() => installDependencies(argv))
    .catch(error => {
      if (/^There seems to be/.test(error.message)) {
        utils.logError(error.message);
        return;
      }
      utils.logError(`An unexpected error occured: "${error.message}"`);
    });
};

function copyFiles(argv) {
  const utils = require('./utils');
  const scaffolder = require('../lib/scaffolder');

  return new Promise((resolve, reject) => {
    utils.log('Creating initial files...');
    scaffolder(
      process.cwd(),
      {
        confirm: true,
        ignoreHash: true,
        name: argv.name,
      },
      error => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

function installDependencies(argv) {
  const utils = require('./utils');
  if (utils.hasFlag('--EXERSLIDE_TEST')) {
    return;
  }

  const childProcess = require('child_process');
  const colors = require('colors');

  return new Promise((resolve, reject) => {
    utils.log(
      'Installing dependencies (`npm install`). This may take a while...'
    );
    const npm = childProcess.spawn(
      'npm',
      ['install', argv.verbose ? '' : '--loglevel=error'],
      {
        stdio: ['inherit', argv.verbose ? 'inherit' : 'ignore', 'inherit'],
      }
    );

    npm.on('exit', code => {
      if (code === 0) {
        utils.log(
          colors.green([
            'Everything is good to go! Next steps: ',
            '',
            '  1. Edit slides inside the "slides/" folder.',
            '  2. Run `exerslide build` to create the presentation.',
            '',
            'You can also run `exerslide serve` first, which starts a local ' +
            'webserver, opens your browser and automatically updates the ' +
            'presentation as you edit the slides.',
          ].join('\n'))
        );
        resolve();
      } else {
        reject(new Error(
          'There seems to be a problem with installing the dependcies. ' +
          'Try running `npm install` yourself.'
        ));
      }
    });
  });
}
