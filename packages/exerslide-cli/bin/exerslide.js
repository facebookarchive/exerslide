#!/usr/bin/env node
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const Liftoff = require('liftoff');
const colors = require('colors/safe');
const path = require('path');
const pkg = require('../package');
const yargs = require('yargs');

const red = colors.red;
const blue = colors.blue;

function logError(msg) {
  process.stdout.write(red(msg) + '\n');
}

const cli = yargs
  .epilog(
    `A tool to generate HTML presentations / tutorials. See ${pkg.homepage} for more info.`
  )
  .demand(1)
  .strict()
  .help()
  .recommendCommands()
  .example('$0 init myPresentation');

// Look for local install via Liftoff
const exerslide = new Liftoff({
  name: 'exerslide',
  configName: 'exerslide.config',
  extensions: {
    '.js': null,
  },
});

exerslide.launch({}, env => {
  cli
    .version(() => {
      const local = env.modulePackage;
      return `Global version: ${blue(pkg.version)}\n` +
        `Local version: ${local ? blue(local.version) : red('unavailable')}`;
    });
  // Load local exerslide commands if available
  if (env.modulePath) {
    loadLocalCommands(path.dirname(env.modulePath), cli);
  } else {
    cli.command(
      'init [name]',
      'create a new exerslide project in the current directory'
    );
  }

  const argv = cli.argv;
  const command = argv._[0];

  if (!env.modulePath) {
    if (command === 'init') {
      installExerslide(argv, env);
    } else {
      logError(
        'Local exerslide version not found, run "exerslide init" first.'
      );
      cli.showHelp();
      process.exit(1);
    }
  }
  // At this point, local exerslide should have handled the command,
  // nothing to do
});

function loadLocalCommands(localExerslidePath, yargs) {
  const commands = require(path.join(
    localExerslidePath,
    'cli'
  ));
  Object.keys(commands).forEach(k => yargs.command(commands[k]));
}

function installExerslide(argv, env) {
  const fs = require('fs');
  const childProcess = require('child_process');
  const pkgPath = path.join(env.cwd, 'package.json');

  // Create a package.json file so that npm install and liftoff work
  if (!fileExists(pkgPath)) {
    try {
      fs.writeFileSync(pkgPath, '{}');
    } catch (err) {
      process.stderr.write(err.message);
      return;
    }
  }

  const npm = childProcess.spawn(
    'npm',
    ['install', 'exerslide'],
    {
      stdio: 'inherit',
      cwd: env.cwd,
      env: process.env,
    }
  );
  npm.on('close', code => {
    if (code !== 0) {
      logError(
        '\nError: There seems to be a problem with npm. Have a look at ' +
        'the above output for more information.'
      );
      return;
    }
    initLocalVersion(argv.name);
  });
}

function initLocalVersion(name) {
  const childProcess = require('child_process');
  // reload local version and delegate
  exerslide.launch({}, env => {
    // if exerslide can still not be found, give up
    if (!env.modulePath) {
      logError(
        'Error: Unable to find local exerslide, even though I just ' +
        'installed it. I give up :('
      );
      return;
    }

    const args = ['init'];
    if (name) {
      args.push(name);
    }
    childProcess.spawn(
      __filename,
      args,
      {
        stdio: 'inherit',
        cwd: env.cwd,
        env: process.env,
      }
    );
  });
}

function fileExists(path) {
  const fs = require('fs');
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
