/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const transformHelper = require('./utils/transformHelper');

const DEFAULT_CONFIG =  {
  pattern: /(?:\.{1,2}\/)+[-_\/a-z\d.]+\.(?:png|jpe?g|gif|svg)\b/ig,
  ignoreMissingFiles: false,
};

/**
 * This transformer tries to automatically detect paths to asset files and
 * converts them to webpack require calls. It also checks whether the path
 * exists in the file system.
 *
 * The advantage of this transformer is that it will pick up files without the
 * author having to mark the file path's explicitly.
 * The disadvantage is that it might consider something as a file path that
 * isn't one. To limit false positives, the default pattern only looks for
 * relative paths (something that stats with `./` or `../`) and for paths
 * that represent images (end in png, jpg, gif or svg) (see above).
 *
 * The pattern can be configured in exerslide.config.js depending on the
 * author's needs.
 *
 * @param {Object} config The following configuration options are available:
 *   - pattern (RegExp): The regex to find file paths. If the pattern has a
 *     capture group, the value of the first capture group will be used as path
 *     instead.
 *   - ignoreMissingFiles (bool): If set to false (default) a warning is shown
 *     if a detected path doesn't exist in the file system. Otherwise those
 *     paths are silently ignored.
 */
module.exports = function requireAssets(config) {
  config = Object.assign({}, DEFAULT_CONFIG, config);
  return {
    before: function(source, next, options) {
      const actions = [];
      const errors = [];

      source = source.replace(config.pattern, (match, p) => {
        if (typeof p === 'number') { // not a capture group
          p = match;
        }
        try {
          fs.accessSync(
            path.join(path.dirname(options.resourcePath), p),
            fs.F_OK
          );
        } catch (ex) {
          if (!config.ignoreMissingFiles) {
            errors.push('Unable to find file: ' + p);
          }
          return match;
        }
        const searchID = transformHelper.getID();
        actions.push(transformHelper.getInterpolateAction(
          searchID,
          `require(${JSON.stringify(p)})`
        ));
        return searchID;
      });
      next(errors, source, actions);
    },
  };
};
