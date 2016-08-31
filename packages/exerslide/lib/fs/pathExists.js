/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const fs = require('fs');

/**
 * Convenience function to test whether a path exists.
 *
 * @param {string} path The path to the file / directory.
 * @return {bool}
 */
module.exports = function fileExists(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};
