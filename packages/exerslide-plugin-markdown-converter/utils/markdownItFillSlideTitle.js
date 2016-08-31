/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This is a markdown-it plugin to use slide titles if no link text is provided.
 */
export default function markdownItFillSlideTitle(md) {
  md.core.ruler.after(
    'inline',
    'link-slide-title',
    function (state) {
      state.tokens.forEach(function (blockToken) {
        if (blockToken.type === 'inline' && blockToken.children) {
          const children = blockToken.children;
          for (let i = 0; i < children.length; i++) {
            const token = children[i];
            if (token.type === 'link_open') {
              const nextToken = blockToken.children[i + 1];
              if (nextToken.type === 'link_close') {
                // Link without any text
                // Get slide options and use the title instead
                const href = token.attrGet('href');
                const slide = getSlideFromURL(state.env.slides, href);
                if (slide) {
                  const text = slide.options.title || slide.options.toc;
                  const textToken = new state.Token('text', '', 0);
                  textToken.content = text;
                  children.splice(i + 1, 0, textToken);
                }
              }
            }
          }
        }
      });
    }
  );
}

function getSlideFromURL(slides, path) {
  if (path.indexOf('#/') !== 0) {
    return false;
  }
  const possibleID = path.substr(2);
  if (!isNaN(possibleID) && possibleID >= 0 && possibleID < slides.length) {
    return slides[possibleID];
  }
  for (let i = 0; i < slides.length; i++) {
    if (slides[i].options.id === possibleID) {
      return slides[i];
    }
  }
  return false;
}
