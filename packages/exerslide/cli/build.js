/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/**
 * This command triggers a production build of the presentation. If a path is
 * passed as argument, the built files are stored there.
 */

exports.command = 'build [out]';
exports.describe = 'create a production-ready version of the presentation';
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
    .example('$0 build')
    .example('$0 build ./site');
};
exports.handler = function(argv) {
  // Enforce a production environment. NODE_ENV is read in configuration files
  // and needs to be set before they are loaded. This is a bit hacky, but works
  // until we find a better solution.
  process.env.NODE_ENV = 'production';

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
      .then(config => builder.build(
        {
          configBase: env.configBase,
          config: config,
        },
        argv
      ))
      .catch(error => utils.logError(error));
  });
};
