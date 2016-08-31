/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const path = require('path');
const resolve = require('resolve');

const RELATIVE_PATH_PATTERN = /\.{1,2}\//;

/**
 * Helper function to correctly resolve plugin references for layout and
 * content type transformers.
 *
 * This also handles the case that a plugin with the name `exerslide-plugin-foo`
 * can be specified just as `foo`.
 *
 * @param {string} pluginName The module name of the plugin
 * @param {string} context Folder to resolve the module from
 * @return {{name: string, path: string}}
 */
module.exports = function resolvePlugin(pluginName, context) {
  // This is to make local development with npm link work
  if (pluginName === 'exerslide') {
    return {
      name: 'exerslide',
      path: path.resolve(__dirname, '../../'),
    };
  }
  // The current project has to be treated in a special way
  if (pluginName === '.' || pluginName === './') {
    return {
      name: '.',
      path: context,
    };
  }
  // local plugins specified by path
  if (RELATIVE_PATH_PATTERN.test(pluginName)) {
    const pluginPath = path.resolve(context, pluginName);
    return {
      name: require(path.join(pluginPath, 'package.json')).name,
      path: pluginPath,
    };
  }

  // node_module / npm plugins
  const lookupName = path.join(pluginName, 'package.json');
  try {
    return {
      name: pluginName,
      path: path.dirname(resolve.sync(
        lookupName,
        {basedir: context}
      )),
    };
  } catch (err) {
    if (err.message.includes('Cannot find module')) {
      return {
        name: pluginName,
        path: path.dirname(resolve.sync(
          'exerslide-plugin-' + lookupName,
          {basedir: context}
        )),
      };
    }
    throw err;
  }
};
