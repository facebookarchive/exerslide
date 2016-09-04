/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Liftoff = require('liftoff');
const colors = require('colors/safe');

/**
 * Various helper functions for the commands.
 */

/**
 * The different commands need access to the exerslide configuration file.
 * We use liftoff to find it.
 */
const liftoff = new Liftoff({
  name: 'exerslide',
  configName: 'exerslide.config',
  extensions: {
    '.js': null,
  },
});

/**
 * Print an error message and terminate if local configuration file wasn't
 * found.
 */
function assertLocalConfig(env) {
  if (!env.configPath) {
    process.stderr.write(
      colors.red(
        `Unable to find exerslide.config.js. You need to run "${process.argv[1]} copy-defaults && npm install" first`
      )
    );
    process.exit(1);
  }
}

exports.launch = function(callback) {
  liftoff.launch({}, env => {
    assertLocalConfig(env);
    callback(env);
  });
};

function logError(msg) {
  process.stderr.write(colors.red(colors.bold('Error ') + msg + '\n'));
}
exports.logError = logError;

function log(msg) {
  process.stdout.write(msg + '\n');
}
exports.log = log;

/**
 * Outputs events from the builder to the console.
 */
exports.logEvents = function logEvents(builder) {
  ['start', 'stop', 'info', 'error', 'warning'].forEach(
    event => builder.on(event, e => log(e.message))
  );

  builder.on('clear',  function clearConsole() {
    process.stdout.write('\x1bc');
  });
};
