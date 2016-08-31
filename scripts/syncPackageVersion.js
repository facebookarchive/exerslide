#!/usr/bin/env node
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');

const PACKAGES_ROOT = path.join(__dirname, '../packages');

function mapObject(obj, fn) {
  return Object.keys(obj)
    .reduce((newObj, key) => ((newObj[key] = fn(obj[key], key)), newObj), {});
}

// 0. Get all package.json files
const packages = fs.readdirSync(PACKAGES_ROOT)
  .filter(name => !/^\./.test(name))
  .map(name => require(path.join(PACKAGES_ROOT, name, 'package.json')))
  .reduce((obj, pkg) => ((obj[pkg.name] = pkg), obj), {});

// 1. Get current version
const versions = mapObject(packages, pkg => pkg.version);

// 2. Update the dependencies and devDependencies of every package
const newPackages = mapObject(packages, pkg => updatePkg(pkg, versions));

// 3. Write package.json objects back to disk
Object.keys(newPackages).forEach(pkgName => {
  const pkg = newPackages[pkgName];
  fs.writeFileSync(
    path.join(PACKAGES_ROOT, pkgName, 'package.json'),
    serializePkg(pkg)
  );
});

// 4. Update scaffolding package.json file
const scaffolingPackagePath = path.join(
  PACKAGES_ROOT,
  'exerslide/scaffolding/package.json'
);
fs.writeFileSync(
  scaffolingPackagePath,
  serializePkg(updatePkg(require(scaffolingPackagePath), versions))
);

// -----------

function updatePkg(pkg, versions) {
  ['dependencies', 'peerDependencies'].forEach(depsName => {
    if (!pkg[depsName]) {
      return;
    }
    pkg[depsName] = mapObject(pkg[depsName], (currentVersion, module) => {
      if (!versions[module]) {
        return currentVersion;
      }
      return (/^\d/.test(currentVersion) ? '' : currentVersion.substr(0, 1)) +
        versions[module];
    });
  });
  return pkg;
}

function serializePkg(pkg) {
  return JSON.stringify(pkg, null, 2) + '\n';
}
