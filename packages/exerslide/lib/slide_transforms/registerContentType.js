/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const getErrorSlideObject = require('./utils/getErrorSlideObject');
const mimeTypes = require('mime-types');
const fileLookupHelper = require('../utils/fileLookupHelper');
const transformHelper = require('./utils/transformHelper');

/**
 * This is an internal transformer that determines the right content type for a
 * slide and updates the source to require the corresponding content converter.
 *
 * If the slide explicitly declares a content type via the `content_type`
 * option, for example
 *
 * ---
 * content_type: text_html
 * ---
 *
 * it uses that. Otherwise it determines the content type based on the file
 * extension (e.g. `*.md` files resolve to markdown).
 *
 * If a content type is found, it looks in the project and loaded plugins if a
 * converter for that type exists.
 */
module.exports = function(config) {
  const converters = config.converters || {};

  return {
    after: function(slide, next, options) {
      const actions = [];
      let error = null;
      let contentType = slide.options.content_type ||
        contentTypeToFileName(mimeTypes.lookup(options.resourcePath));

      if (contentType) {
        let converterPath;

        if (contentType.includes(':')) { // reference to specific plugin/converter
          converterPath = fileLookupHelper.resolvePluginReference(
            contentType,
            converters
          );
          if (!converterPath) {
            error = `Unknown content type "${contentType}".`;
          }
        } else {
          const normalizedContentTypeName = fileLookupHelper.normalizeFileName(
            contentType
          );
          // Go through all plugins
          const pluginsWithConverters = Object.keys(converters).filter(
            pluginName => (
              converters[pluginName].hasOwnProperty(normalizedContentTypeName)
            )
          );
          switch (pluginsWithConverters.length) {
            case 0:
              error = `Unknown content type "${contentType}".`;
              break;
            case 1:
              converterPath = converters[pluginsWithConverters[0]][normalizedContentTypeName];
              break;
            default:
              error = `Found multiple content type converters with name "${contentType}".` +
                'You can refer to a specific one by providing the plugin name. ' +
                `For example: ${pluginsWithConverters.map(p => p+':'+contentType).join(', ')}.`;
          }
        }
        if (error) {
          // Unless the content type was specified explicitly, we simply
          // treat unknown  content types as text
          if (slide.contentType) {
            const knownConverters = Object.keys(converters).reduce(
              (list, pluginName) => (
                list.concat(Object.keys(converters[pluginName]).map(
                  contentType => (
                    pluginName + ':' + contentType
                  )
                ))
              ),
              []
            );
            Object.assign(
              slide,
              getErrorSlideObject(
                'Unknown content type',
                options.resourcePath,
                {
                  message: error + '\n\nKnown content type converters:\n\n' +
                    knownConverters.join('\n'),
                }
              )
            );
          }
        } else if (converterPath) {
          const importID = transformHelper.getID();
          actions.push(
            transformHelper.getImportAction(importID, converterPath),
            transformHelper.getAssignAction('contentConverter', importID)
          );
        }
      }

      next(error, slide, actions);
    },
  };
};

function contentTypeToFileName(type) {
  if (type) {
    return type.replace('/', '_');
  }
}
