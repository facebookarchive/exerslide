/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fileLookupHelper = require('../utils/fileLookupHelper');
const getErrorSlideObject = require('./utils/getErrorSlideObject');
const path = require('path');
const transformHelper = require('./utils/transformHelper');

/**
 * This is an internal transformer that finds the right layout component for a
 * slide.
 *
 * If the slide explicitly declares a layout via the `layout` option,
 * for example
 *
 * ---
 * layout: Center
 * ---
 *
 * it uses that. Otherwise it uses the past in file extension map to determine
 * the layout.
 *
 * If a layout is specified, it looks in the project and loaded plugins for the
 * corresponding layout component.
 */
module.exports = function(config) {
  const layouts = config.layouts || {};
  const defaultLayouts = config.defaultLayouts || {};

  return {
    after: function(slide, next, options) {
      let error = null;
      const actions = [];
      const layout = slide.options.layout ||
        detectLayoutFromFileName(
          options.resourcePath,
          defaultLayouts
        );

      if (layout) {
        let layoutPath;

        if (layout.includes(':')) { // reference to specific plugin/layout
          layoutPath = fileLookupHelper.resolvePluginReference(layout, layouts);
          if (!layoutPath) {
            error = `Unknown layout "${layout}".`;
          }
        } else {
          const normalizedLayoutName = fileLookupHelper.normalizeFileName(
            layout
          );
          // Go through all plugins
          const pluginsWithLayout = Object.keys(layouts).filter(
            pluginName => (
              layouts[pluginName].hasOwnProperty(normalizedLayoutName)
            )
          );
          switch (pluginsWithLayout.length) {
            case 0:
              error = `Unknown layout "${layout}".`;
              break;
            case 1:
              layoutPath = layouts[pluginsWithLayout[0]][normalizedLayoutName];
              break;
            default:
              error = `Found multiple layouts with name "${layout}".\n` +
                'You can refer to a specific one by providing the plugin name.\n' +
                `For example: ${pluginsWithLayout.map(p => p+':'+layout).join(', ')}.`;
          }
        }

        if (error) {
          const knownLayouts = Object.keys(layouts).reduce(
            (list, pluginName) => (
              list.concat(Object.keys(layouts[pluginName]).map(
                layoutName => pluginName + ':' + layoutName
              ))
            ),
            []
          );
          Object.assign(
            slide,
            getErrorSlideObject(
              'Unknown layout',
              options.resourcePath,
              {
                message: error + '\n\nKnown layouts: \n\n' +
                  knownLayouts.join('\n'),
              }
            )
          );
          layoutPath = path.join(
            __dirname,
            '../../layouts/__ExerslideError__.js'
          );
        }
        const importID = transformHelper.getID();
        actions.push(
          transformHelper.getImportAction(importID, layoutPath),
          transformHelper.getAssignAction('layout', importID)
        );
      }

      next(error, slide, actions);
    },
  };
}

/**
 * Given a file extension layout map, this returns the layout for the given
 * path or null.
 */
function detectLayoutFromFileName(filePath, fileTypeToLayoutMap) {

  let ext = path.basename(filePath);

  while (ext.indexOf('.', 1) > -1 && (ext = ext.substr(ext.indexOf('.', 1)))) {
    if (fileTypeToLayoutMap.hasOwnProperty(ext)) {
      return fileTypeToLayoutMap[ext];
    }
  }
  return null;
}
