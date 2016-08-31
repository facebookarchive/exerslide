/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This command copies all the initial project files into the current working
 * directory. The user can choose between multiple options in case the file
 * already exists.
 */

exports.command = 'copy-defaults';
exports.describe =
  'copy the initial project files into the current directory. Can also be ' +
  'used to update files after (local) exerslide was updated.';
exports.builder = function(yargs) {
  return yargs
    .options({
      name: {
        describe: 'Presentation name to use in templates.',
        nargs: 1,
        requiresArg: true,
        type: 'string',
      },
      force: {
        alias: ['f'],
        describe: 'Overwrite existing files (DANGER: Only use this option if you '+
            'have a backup of your current files or use a version control system',
        type: 'boolean',
        default: false,
      },
    })
    .example('$0 copy-files --name myPresentation');
};

exports.handler = function(argv) {
  const scaffolder = require('../lib/scaffolder');
  const utils = require('./utils');

  scaffolder(process.cwd(), argv, error => {
    if (error) {
      utils.logError(`Unable to copy defaults: ${error.message}`);
      process.exit(1);
    }
    utils.log(
      'All files updated! You may have to run `npm install` if "package.json"' +
      ' has changed.'
    );
  });
};
