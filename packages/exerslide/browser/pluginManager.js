/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as exerslide from '../browser';

/**
 * Plugins are simply functions that get passed the exerslide browser API. The
 * manager makes sure that a plugin is only executed once. It also passes
 * the browser API to them.
 */

const plugins = [];

export function register(plugin, ...args) {
  if (plugins.indexOf(plugin) === -1) {
    plugin(exerslide, ...args);
    plugins.push(plugin);
  }
}
