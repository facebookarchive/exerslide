/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/**
 * Helper module for finding files to autoload.
 */
const fs = require('fs');
const path = require('path');
const pathExists = require('../fs/pathExists');
const resolvePlugin = require('./resolvePlugin');

/**
 * Given a list of plugins and a folder path, this function will find, for each
 * plugin, all files in the corresponding folder.
 *
 * Plugin names are resolved like Node does, in the current working directory.
 *
 * The return value is something like:
 *
 *   {
 *     <plugin name>: {
 *       <filename-without-extension>: "<absolute-path-to-file>",
 *     }
 *   }
 *
 * for example:
 *
 *   {
 *     MyPlugin: {
 *       Center: "/myProject/node_modules/MyPlugin/folder/Center.js
 *     }
 *   }
 *
 * @param {Array<string>} plugins An array of module names
 * @param {string} folder The folder to find in each module root directory
 * @param {string} context The folder to resolve the modules from
 * @return {Object}
 */
exports.listFilesFromPlugins = function(plugins, folder, context) {
  return plugins
    .map(plugin => resolvePlugin(plugin, context))
    .reduce(
      (list, plugin) => {
        const folderPath = path.join(plugin.path, folder);
        if (pathExists(folderPath)) {
          list[plugin.name] = fs.readdirSync(folderPath).reduce(
            (files, fileName) => {
              const filePath = path.join(folderPath, fileName);
              if (fs.lstatSync(filePath).isFile()) {
                const indexDot = fileName.lastIndexOf('.')
                const name = indexDot === -1 ?
                  fileName :
                  fileName.substring(0, indexDot);
                files[normalizeFileName(name)] = filePath;
              }
              return files;
            },
            {}
          );
        }
        return list;
      },
      {}
    );
};

/**
 * Takes a file reference of the form `plugin:file` and finds the
 * corresponding path in the passed file list created by `listFilesFromPlugins`.
 *
 * @param {string} fileReference File to find
 * @param {Object} fileList Created by `listFilesFromPlugins`
 * @return {?string}
 */
exports.resolvePluginReference = function(fileReference, fileList) {
  const colonIndex = fileReference.indexOf(':');
  const pluginName = fileReference.substring(0, colonIndex);
  const fileName = normalizeFileName(fileReference.substring(colonIndex + 1));

  return fileList[pluginName] && fileList[pluginName][fileName] || null;
};

function normalizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9_.-]+/ig, '_');
}
exports.normalizeFileName = normalizeFileName;
