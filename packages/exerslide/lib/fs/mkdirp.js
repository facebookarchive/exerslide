/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Ensures that the directory and all it's parents exists.
 *
 * @param {string} p Path to the directory
 * @return {Promise}
 */
module.exports = function mkdirp(p) {
  return new Promise((resolve, reject) => {
    fs.mkdir(p, (err) => {
      if (!err) {
        resolve();
        return;
      }
      switch (err.code) {
        case 'ENOENT':
          return mkdirp(path.dirname(p))
            .then(() => mkdirp(p))
            .then(resolve, reject);
        case 'EEXIST':
          resolve();
          break;
        default:
          reject(err);
      }
    });
  });
};
