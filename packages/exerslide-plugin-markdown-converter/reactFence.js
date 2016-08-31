/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/**
 * This runtime plugin enables authors to replace specific blocks in markdown
 * files with custom React components.
 *
 * Usage example:
 *
 * exerslide.use(reactFence, (tag, content) {
 *   if (tag === 'component') {
 *     return <Component />;
 *   }
 * });
 */
import reactRenderer, {renderIntoDOM} from './utils/renderIntoDOM';
import markdownItReactFence from './utils/markdownItReactFence';

export default function reactFence(exerslide, factory) {
  exerslide.use(reactRenderer);
  exerslide.subscribe('CONFIG.SET', config => {
    const existingExtension = config['markdown-converter'];

    config['markdown-converter'] = md => {
      md.use(markdownItReactFence, (token, env) => {
        const component = factory(token.info, token.content, env);
        if (component) {
          return renderIntoDOM(
            env.slideIndex,
            component
          );
        }
        return '';
      });
      existingExtension && existingExtension(md);
    };
  });
}
