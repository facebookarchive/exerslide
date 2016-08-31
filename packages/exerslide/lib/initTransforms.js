/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const listFilesFromPlugins = require('./utils/fileLookupHelper').listFilesFromPlugins;

/**
 * This function adds the necessary built-in transforms to the webpack config.
 *
 * We decided to do this internally and not in the default webpack.config.js
 * to
 *
 *   - prevent authors from accidentally breaking exerslide by removing one of
 *     these transforms
 *   - reduce the complexity of the webpack.config.js file
 */
module.exports = function initTransforms(exerslideConfig, webpackConfig) {
  // These transforms are required for exerslide to work properly
  let transforms = webpackConfig.slideLoader.transforms;
  if (!transforms) {
    transforms = webpackConfig.slideLoader.transforms = [];
  }

  const plugins = exerslideConfig.plugins;
  plugins.push('./'); // look in current project
  if (!plugins.indexOf('exerslide') > -1) {
    plugins.push('exerslide');
  }

  transforms.push(
    require('./slide_transforms/hashPath')(),
    require('./slide_transforms/registerContentType')({
      converters: listFilesFromPlugins(
        plugins,
        'contentTypes',
        webpackConfig.context
      ),
    }),
    require('./slide_transforms/registerLayout')({
      layouts: listFilesFromPlugins(plugins, 'layouts', webpackConfig.context),
      defaultLayouts: exerslideConfig.defaultLayouts,
    })
  );

}

