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

function log(msg) {
  process.stdout.write(msg + '\n');
}

function logError(msg) {
  process.stderr.write(msg + '\n');
}

function exitWithError(msg) {
  logError(msg);
  process.exit(1);
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
      'create a new exerslide project in the current directory',
      {
        verbose: {
          alias: 'v',
          description: 'Show the `npm install` output.',
        },
      }
    );
  }

  const argv = cli.argv;
  const command = argv._[0];

  if (!env.modulePath) {
    if (command === 'init') {
      installExerslide(argv, env);
    } else {
      logError(
        red('Local exerslide version not found, run "exerslide init" first.')
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
  const spawn = require('cross-spawn');
  const pkgPath = path.join(env.cwd, 'package.json');

  if (fs.readdirSync(env.cwd).length > 0) {
    exitWithError(
      red('Error: Directory is not empty!\n') +
      'It seems you are trying to initialize a new project in an existing ' +
      'directory. To prevent accidentally overriding your files, run ' +
      '`exerslide init` in an empty directory.'
    );
  }
  // Create a package.json file so that npm install and liftoff work
  try {
    fs.writeFileSync(pkgPath, '{}');
  } catch (err) {
    exitWithError(red('Unable to initialize new project: ') + err.message);
  }

  log(
    'Installing exerslide (`npm install exerslide`). This may take a while...'
  );
  const npm = spawn(
    'npm',
    ['install', argv.verbose ? '' : '--loglevel=error', 'exerslide'],
    {
      stdio: argv.verbose ?
        'inherit' :
        ['inherit', 'ignore', 'inherit'],
      cwd: env.cwd,
      env: process.env,
    }
  );

  npm.on('close', code => {
    if (code !== 0) {
      exitWithError(red(
        '\nError: There seems to be a problem with npm. Have a look at ' +
        `the above output or ${blue('npm-debug.log')} for more information.`
      ));
    }
    initLocalVersion();
  });
}

function initLocalVersion() {
  const spawn = require('cross-spawn');
  // reload local version and delegate
  exerslide.launch({}, env => {
    // if exerslide can still not be found, give up
    if (!env.modulePath) {
      exitWithError(red(
        'Error: Unable to find local exerslide, even though I just ' +
        'installed it. I give up :('
      ));
    }

    spawn(
      'node',
      [
        __filename,
        ...process.argv.slice(2), // pass original arguments
      ],
      {
        stdio: 'inherit',
        cwd: env.cwd,
        env: process.env,
      }
    );

  });
}
