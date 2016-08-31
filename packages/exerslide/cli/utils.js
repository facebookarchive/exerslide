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

function logWarning(msg) {
  process.stderr.write(colors.yellow(colors.bold('Warning ') + msg + '\n'));
}

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
  builder.on('start', function(e) {
    log(`Starting '${colors.cyan(e.task)}' ...`);
  });

  builder.on('stop', function(e) {
    log(`Finished '${colors.cyan(e.task)}'`);
  });

  builder.on('info', function(e) {
    log(`'${colors.cyan(e.task)}': ${e.message}`);
  });

  builder.on('error', function(e) {
    logError(`in ${colors.cyan(e.task)}: ${e.error.toString()}`);
  });

  builder.on('warning', function(e) {
    logWarning(`in ${colors.cyan(e.task)}: ${e.warning.toString()}`);
  });
};
