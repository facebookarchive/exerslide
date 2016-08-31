/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import ContentRenderer from 'exerslide/components/ContentRenderer';
import {normalizeImageData} from 'exerslide/browser';

import './css/Center.css';

/**
 * Layout that horizontally and vertically centers its content.
 *
 *
 * Layout data:
 *
 *  - image: A path/URL to an image or an image object ({src: ..., alt: ...})
 *
 * If `image` specified but no content, the image will be centered.
 * If both, `image` and content are specified, the image becomes the centered
 * background-image of the slide.

 * +-----------------------+   +-----------------------+   +-----------------------+
 * |                       |   |                       |   |                       |
 * |                       |   |   +---------------+   |   |   +---------------+   |
 * |                       |   |   |               |   |   |   |               |   |
 * |     Centered Text     |   |   |               |   |   |   | Centered Text |   |
 * |                       |   |   |               |   |   |   |               |   |
 * |                       |   |   +---------------+   |   |   +---------------+   |
 * |                       |   |                       |   |                       |
 * +-----------------------+   +-----------------------+   +-----------------------+
 *
 */
export default function Center({title, layoutData, content}) {
  let {image} = layoutData;
  const style = {};
  let child = <ContentRenderer value={content} />
  image = normalizeImageData(image);
  if (image && (content || title)) {
    // image becomes background image
    style.background = `no-repeat center url("${image.src}")`;
  } else if (image) {
    child = <img src={image.src} alt={image.alt || ''} />;
  }
  return (
    <div className="Center-wrapper" style={style}>
      {title}
      {child}
    </div>
  );
}
