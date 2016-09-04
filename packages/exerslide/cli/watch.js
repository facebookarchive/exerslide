/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/**
 * This command builds the presentation and rebuilds it whenever a dependent
 * runtime file changes.
 */
exports.command = 'watch [out]';
exports.describe = 'create a developement version of the presentation and automatically rebuild on file changes';
exports.builder = function(yargs) {
  return yargs
    .option({
      verbose: {
        alias: ['v'],
        boolean: true,
        describe:
          'Show more detailed webpack output instead (useful for debugging webpack).',
        default: false,
      },
    })
    .example('$0 watch')
    .example('$0 watch ./site');
};
exports.handler = function(argv) {
  const utils = require('./utils');

  utils.launch(env => {
    const builder = require('../lib/builder');
    let exerslideConfig = Promise.resolve(require(env.configPath));

    utils.logEvents(builder);
    if (argv.out) {
      const mkdirp = require('../lib/fs/mkdirp');
      const path = require('path');
      const out = path.resolve(argv.out);
      utils.log(`Building into "${out}"`);
      exerslideConfig = exerslideConfig.then(config => (
        mkdirp(out).then(() => {
          config.out = path.resolve(out);
          return config;
        })
      ));
    }

    exerslideConfig
      .then(config => builder.watch(
        {
          configBase: env.configBase,
          config: config,
        },
        argv
      ))
      .catch(error => utils.logError(error));
  });
};
