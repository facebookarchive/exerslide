/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This command builds the development version of the presentation,
 * starts the webpack development server and opens the browser. Changes to any
 * of the runtime files will trigger an automatic reload of the browser.
 */
exports.command = 'serve';
exports.describe = 'create a developement version of the presentation and serve it via a local webserver';
exports.builder = function(yargs) {
  return yargs
    .option({
      port: {
        alias: 'p',
        describe: 'Port the webserver should listen to',
        requiresArg: true,
        nargs: 1,
        default: 8080,
      },
      'open-browser': {
        alias: 'o',
        boolean: true,
        describe: 'Automatically open presentation in browser.',
        default: true,
      },
      verbose: {
        alias: ['v'],
        boolean: true,
        describe:
          'Show more detailed webpack output instead (useful for debugging webpack).',
        default: false,
      },
    })
    .example('$0 serve')
    .example('$0 serve --no-open-browser')
    .example('$0 serve -p 8000');
};
exports.handler = function(argv) {
  const utils = require('./utils');

  utils.launch(env => {
    const builder = require('../lib/builder');
    const exerslideConfig = require(env.configPath);

    utils.logEvents(builder);
    builder.serve(
      {
        configBase: env.configBase,
        config: exerslideConfig,
      },
      argv
    );
  });
};
