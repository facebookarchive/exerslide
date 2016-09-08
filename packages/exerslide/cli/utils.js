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

// Used to test exerslide by building the website
const smokeTest = process.argv.some(arg => arg === '--smoke-test');

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
        `Unable to find exerslide.config.js.\nYou need to run "exerslide init" first.\n`
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

exports.logError = smokeTest ?
  () => process.exit(1) :
  msg => process.stderr.write(colors.red(colors.bold('Error ') + msg + '\n'));


function log(msg) {
  process.stdout.write(msg + '\n');
}
exports.log = log;

/**
 * Outputs events from the builder to the console.
 */
exports.logEvents = function logEvents(builder) {
  if (smokeTest) {
    ['error', 'warning'].forEach(
      event => builder.on(event, () => process.exit(1))
    );
  }
  ['start', 'stop', 'info', 'error', 'warning'].forEach(
    event => builder.on(event, e => log(e.message))
  );

  builder.on('clear',  function clearConsole() {
    process.stdout.write('\x1bc');
  });
};

exports.hasFlag = function hasFlag(flag) {
  return process.argv.some(x => x === flag);
}
