/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This is a custom render rule to identify react blocks and get access to their
 * content. Overwriting the default render is sufficient, there was no need
 * for a custom parser rule.
 *
 * @param {Object} md The markdown-it instance
 * @param {function} renderer The custom renderer
 */
export default function reactFenceMD(md, renderer) {
  const oldRender = md.renderer.rules.fence ||
    function(tokens, index, options, env, self) {
      return self.renderToken(tokens, index, options);
    };
  const PATTERN = /\s*react\b\s*/i;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index];
    if (PATTERN.test(token.info)) {
      token.info = token.info.replace(PATTERN, '');
      return renderer(token, env);
    }
    return oldRender(tokens, index, options, env, self);
  };
}
