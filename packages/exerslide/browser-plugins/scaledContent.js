/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

/**
 * This plugin is used to control the automatic scaling of the presentation.
 * It is defined how wide the content should be and how much of the viewport
 * width should the content occupy. The content width is defined in em units
 * and the column width to occupy as a fraction (1 = full screen width).
 * At a font size of 16px, a content width of 38 seem to generate good,
 * readable results.
 *
 * Usage:
 *
 * More words per line (higher contentWidth value) => smaller font size
 *
 *   exerslide.use(scaledContentPlugin, {contentWidth: 45});
 *
 * Wider content column => large font size
 *
 *   exerslide.use(scaledContentPlugin, {columnWidth: 0.7});
 */
export default function scaledContentPlugin(exerslide, options={}) {
  // We only perform the measurement once at page load. This allows viewers
  // to zoom in or out to adjust the size if needed.
  exerslide.subscribe(
    'SITE.LOADED',
    ({slides}) => {
      const firstSlideOptions = slides[0] && slides[0].options;
      const shouldScale =  options !== false &&
        (!firstSlideOptions || firstSlideOptions.scale !== false);

      if (shouldScale) {
        options = firstSlideOptions && firstSlideOptions.scale || options;

        scaleFont(
          global.document.documentElement,
          {...defaultScaleOptions,... options}
        );

        exerslide.registerExtension(
          ScaledContentWidth,
          'wrap',
          ['content']
        );
      }
    }
  );
}

const defaultScaleOptions = {
  contentWidth: 38, // ems
  columnWidth: 0.55, // [0-1]
  // maxFontSize: 48 // px
};

let memorizedContentWidth;

function getContentWidthStyle() {
  return memorizedContentWidth ? {maxWidth: memorizedContentWidth + 'em'} : {};
}

/**
 * This function computes the font size that needs to be set on the element
 * (the document element in this case) based on the desired settings of the
 * content width, column width and max font size
 */
function scaleFont(element, {contentWidth, maxFontSize, columnWidth}) {
  memorizedContentWidth = contentWidth;
  const initialFontSize = parseInt(
    global.getComputedStyle(element).fontSize,
    10
  );
  const realContentWidth = initialFontSize * contentWidth;
  const viewportWidth = element.clientWidth;
  if (realContentWidth <= viewportWidth) {
    let newFontSize = (viewportWidth * columnWidth) / contentWidth;
    if (newFontSize < initialFontSize) {
      newFontSize = '';
    } else if (maxFontSize && newFontSize > maxFontSize) {
      newFontSize = maxFontSize + 'px';
    } else {
      newFontSize += 'px';
    }
    element.style.fontSize = newFontSize;
  }
}

/**
 * This component simply updates the style of the wrapped component to set the
 * desired content width.
 */
function ScaledContentWidth(props) {
  const {
    children,
    slide: _slide,
    slideIndex: _slideIndex,
    slides: _slides,
    style,
    ...restProps,
  } = props;
  const child = React.Children.only(children);
  return React.cloneElement(
    child,
    {
      ...restProps,
      style: {...style, ...getContentWidthStyle()},
    }
  );
}
