/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This helper function evaluates passed in code as CommonJS module.
 *
 * @param {string} code JavaScript source code.
 * @return {?} whatever the code exports
 */
export function evalScript(code) {
  const module = {};
  const exports = module.exports = {};
  const Module = new Function('module, exports, global', code);
  Module(module, exports, global);
  return module.exports;
}
