/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Render link as _blank, unless it's a local one (starting with `#`)
 * Taken straight from the markdown-it example
 */
export default function markdownItBlankLinks(md) {
  const defaultRender = md.renderer.rules.link_open ||
    function(tokens, index, options, env, self) {
      return self.renderToken(tokens, index, options);
    };

  md.renderer.rules.link_open = function (tokens, index, options, env, self) {
    const token = tokens[index];
    const href = token.attrGet('href');

    if (href.charAt(0) !== '#') {
      token.attrSet('target', '_blank');
    }
    return defaultRender(tokens, index, options, env, self);
  };
}
