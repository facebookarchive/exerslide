/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const extractLanguageHighlights = require('./extractLanguageHighlights');
const fs = require('fs');
const path = require('path');

function getLanguages() {
  const languageDir = path.join(
    path.dirname(require.resolve('highlight.js')),
    'languages'
  );
  const hljs = require('highlight.js');

  return fs.readdirSync(languageDir)
    .filter(name => /\.js$/.test(name))
    .reduce(
      (list, name) => {
        const filePath = path.join(languageDir, name);
        // Require language module to get aliases
        const aliases = require(filePath)(hljs).aliases;
        [path.basename(name, '.js')].concat(aliases).forEach(
          n => list[n] = filePath
        );
        return list;
      },
      {}
    );
}

module.exports = function(exerslideConfig, webpackConfig) {
  webpackConfig.slideLoader.transforms.push(
    extractLanguageHighlights({languagePaths: getLanguages()})
  );
};
