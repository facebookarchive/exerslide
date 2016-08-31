/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const glob = require('glob');
const glob2base = require('glob2base');
const mkdirp = require('./mkdirp');
const path = require('path');

/**
 * Copies all files matching an array of glob patterns.
 *
 * @param {Array<string>} globs An array of glob patterns
 * @param {string} out Target root directory
 * @param {string} base Base directory to evaluate globs against.
 * @return {Promise}
 */
module.exports = function copyGlobs(globs, out, base) {
  const rootTargetDir = path.resolve(base, out);
  const globOptions = {cwd: base, nodir: true, silent: true};

  return Promise.all(globs.map(pattern => new Promise((resolve, reject) => {
    const g = new glob.Glob(pattern, globOptions);

    g.on('end', matches => {
      const globBase = glob2base(g);

      Promise.all(matches.map(file => {
        const targetFileAbs = path.resolve(
          rootTargetDir,
          path.relative(globBase, file)
        );
        return mkdirp(path.dirname(targetFileAbs))
          .then(() => copyFile(path.resolve(base, file), targetFileAbs))
      }))
      .then(resolve, reject);
    });
    g.on('error', reject);
  })));
}

function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(source);
    const ws = fs.createWriteStream(target);
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('finish', () => resolve());
    rs.pipe(ws);
  });
}
