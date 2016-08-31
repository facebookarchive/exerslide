/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const path = require('path');
const resolvePlugin = require('./utils/resolvePlugin');

/**
 * This function goes through all specified plugins and calls there init
 * function if it exists.
 *
 * The init function is a function exported by `init.js` in the plugin's folder.
 */
module.exports = function initPlugins(exerslideConfig, webpackConfig) {
  // Initialize plugins
  const exerslidePlugins = exerslideConfig.plugins || [];
  const context = webpackConfig.context;

  exerslidePlugins.forEach(function(pluginName) {
    const plugin = resolvePlugin(pluginName, context);
    let init;
    try {
      init = require(path.join(plugin.path, 'init'));
    } catch (err) {
      if (err.message.indexOf('Cannot find module') === -1) {
        throw err;
      }
    }

    if (init) {
      init(exerslideConfig, webpackConfig);
    }
  });
};
