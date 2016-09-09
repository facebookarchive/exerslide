#!/usr/bin/env node
/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

// A helper script to setup an example presentation in the provided directory
// (or a default path). It will link all packages and dependencies.

const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');

function pathExists(p) {
  try {
    fs.accessSync(p, fs.R_OK);
    return true;
  } catch(e) {
    return false;
  }
}

function hasPkg(dir) {
  return pathExists(path.join(PACKAGESPATH, dir, 'package.json'));
}

function peerDependencies(dir) {
  try {
    const deps = require(path.join(PACKAGESPATH, dir, 'package.json'))
      .peerDependencies || {};
    return Object.keys(deps);
  } catch(e) {
    console.log(e);
    return [];
  }
}

function run(cmd, options) {
  console.log(
    '  Running',
    options && options.cwd ? `in "${path.relative(CWD, options.cwd)}":\n   ` : '',
    `"${cmd}"`
  );
  childProcess.execSync(
    cmd,
    Object.assign({stdio: ['inherit', 'ignore', 'inherit']}, options)
  );
}

const CWD = process.cwd();
const TARGETPATH = path.join(CWD, process.argv[2] || 'test');
const PACKAGESPATH = path.resolve(__dirname, path.join('..', 'packages'));

fs.ensureDirSync(TARGETPATH);

const PACKAGES = fs.readdirSync(PACKAGESPATH)
 .filter(hasPkg);

const ALL_PEER_DEPENDENCIES = Array.from(
  new Set(
    PACKAGES
      .map(peerDependencies)
      .reduce((r, v) => (r.push.apply(r, v), r))
  )
);

const INSTALLED_PEER_DEPENDENCIES = ALL_PEER_DEPENDENCIES
  .filter(v => PACKAGES.indexOf(v) === -1);

// 0. Install peer dependencies globally
console.log('0. Install all peer dependencies globally');
run(`npm rm -g --loglevel=error ${INSTALLED_PEER_DEPENDENCIES.join(' ')}`);
run(`npm install -g --loglevel=error ${INSTALLED_PEER_DEPENDENCIES.join(' ')}`);

// 1. "npm link" all packages
console.log('\n1. Link all packages');

PACKAGES.sort().forEach(name => {
  // Link their peer dependencies
  const p = path.join(PACKAGESPATH, name);
  const pkg = require(path.join(p, 'package.json'));
  const deps = Object.keys(pkg.peerDependencies || {});
  if (deps.length > 0) {
    run(`npm link --loglevel=error ${deps.join(' ')}`, {cwd: p});
  }

  // Make packages globally available
  run('npm link --loglevel=error', {cwd: p});
});

// 2. Init example project
console.log('\n2. Initializing test project ...');
// We cannot run exerslide init since it would try to install exerslide from npm
// Instead we link it manually
fs.ensureDirSync(path.join(TARGETPATH, 'node_modules'));

run(
  `npm link --loglevel=error ${path.join(PACKAGESPATH, 'exerslide')}`,
  {cwd: TARGETPATH}
);

// Disable confirm in tests
const confirm = process.argv.some(x => x === '--test') ? 'false' : 'true';
run(
  `exerslide copy-defaults --ignore-hash --confirm=${confirm}`,
  {stdio: ['inherit', 'inherit', 'inherit'], cwd: TARGETPATH}
);


// 3. Removing "exerslide" from the dependencies
console.log('\n3. Removing "exerslide*" dependencies...');

const linkedDependencies = [];
const pkg = require(path.join(TARGETPATH, 'package.json'));

for (let name in pkg.dependencies) {
  if (/^exerslide/.test(name) || INSTALLED_PEER_DEPENDENCIES.indexOf(name) > -1) {
    delete pkg.dependencies[name];
    linkedDependencies.push(name);
  }
}

for (let name in pkg.devDependencies) {
  if (INSTALLED_PEER_DEPENDENCIES.indexOf(name) > -1) {
    delete pkg.devDependencies[name];
    linkedDependencies.push(name);
  }
}

fs.writeJsonSync(path.join(TARGETPATH, 'package.json'), pkg);

// 4. Install dependencies
console.log('\n4. Installing dependencies...');

run('npm install --loglevel=error', {cwd: TARGETPATH});


// 5. Link packages
console.log('\n5. Linking global exerslide and global dependencies...');

run(
  `npm link --loglevel=error ${linkedDependencies.join(' ')}`,
  {cwd: TARGETPATH}
);
