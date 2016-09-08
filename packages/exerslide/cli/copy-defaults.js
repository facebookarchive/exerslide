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
      'overwrite-all': {
        alias: ['a'],
        describe: 'Overwrite existing files (DANGER: Only use this option if you '+
            'have a backup of your current files or use a version control system',
        type: 'boolean',
        default: false,
      },
      confirm: {
        alias: ['c'],
        describe:
          'Ask what to do if file already exists. ' +
          'If set to false, keep the existing file.',
        type: 'boolean',
        default: true,
      },
      'ignore-hash': {
        describe: 'Don\'t compare file hashes of existing files. If set to ' +
          'true, you will asked for any existing file that differs from the ' +
          'template file.',
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
