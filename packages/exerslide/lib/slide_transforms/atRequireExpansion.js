/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const transformHelper = require('./utils/transformHelper');

const DEFAULT_REQUIRE_PATTERN = /@require\(([^)]+)\)/ig;

/**
 * This transformer finds occurrences of `@require(path/to/file)` in slide files
 * and replaces them with webpack `require` calls so that webpack can load that
 * file.
 *
 * Together with other webpack loaders, such as `raw-loader`, this can be used
 * to include the content of another file into the slide.
 *
 * For example
 *
 * ---
 * ```js
 * @require('!!raw!./test.js')
 * ```
 *
 * is transformed into something like
 *
 * module.exports = {
 *   content: "```js\n" + require('!!raw!./test.js) + "\n```",
 * };
 *
 * which, when executed results in something like
 *
 * module.exports = {
 *   content: "```js\n<content_of_file>\n```",
 * };
 *
 * @param {Object} config The following configuration options are available
 *   - pattern (RegEx): Allows to customize the pattern to search for. The path
 *   should be return in the first capture group.
 */
module.exports = function(config) {
  const REQUIRE_PATTERN = config && config.pattern || DEFAULT_REQUIRE_PATTERN;

  return {
    before: function(source, next) {
      const actions = [];
      source = source.replace(REQUIRE_PATTERN, (match, path) => {
        path = path.replace(/^['"]|['"]$/g, '');
        const searchID = transformHelper.getID();
        actions.push(transformHelper.getInterpolateAction(
          searchID,
          `require(${JSON.stringify(path)})`
        ));
        return searchID;
      });
      next(null, source, actions);
    },
  };
};
