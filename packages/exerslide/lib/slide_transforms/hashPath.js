/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const crypto = require('crypto');
const path = require('path');

/**
 * This is an internal transformer that computes a hash of the parent path of
 * the slide. This is used to group slides by folder at runtime.
 */
module.exports = function() {
  return {
    after: function(slide, next, options) {
      slide.pathHash = crypto.createHash('md5')
        .update(path.dirname(options.resourcePath))
        .digest('hex');
      next(null, slide);
    },
  };
};
