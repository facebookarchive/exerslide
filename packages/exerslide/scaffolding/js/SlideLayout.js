// @remove-on-copy-start
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// @remove-on-copy-end
/*
 * This hash helps exerslide to determine whether the file needs to be updated
 * or not. Please don't remove it.
 * @exerslide-file-hash
 */

import ExtensionPoint from 'exerslide/components/ExtensionPoint';
import React from 'react';

/**
 * The base layout for every slide. This allows you do add additional
 * content to all slides before or after the content.
 */
export default function SlideLayout({children}) {
  return (
    <ExtensionPoint tags={['slide', 'a11y-announce-content', 'content']}>
      <div>
        {children}
      </div>
    </ExtensionPoint>
  );
}

SlideLayout.propTypes = {
  /**
   * The current slide content and header are passed in as children by exerslide
   */
  children: React.PropTypes.node,
};
