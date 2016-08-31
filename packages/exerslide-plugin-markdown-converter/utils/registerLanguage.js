/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var hljs = require('highlight.js/lib/highlight');

var seen = new Set();

module.exports = function(languages) {
  for (var lang in languages) {
    if (!seen.has(lang)) {
      hljs.registerLanguage(lang, languages[lang]);
    }
  }
};
