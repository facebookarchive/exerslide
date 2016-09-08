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
import TOC from './components/TOC';
import Toolbar from './components/Toolbar';

/**
 * The master layout specifies the overall layout of the page, such as
 * the table of contents, a progress indicator and of course the slide itself.
 * The current slide component is passed as child to it.
 *
 * Be default the master layout renders a table of contents, navigation buttons
 * and the slide content:
 *
 * +----------------------------------------+
 * |+---------+ +--------------------------+|
 * ||         | | +-----------------------+||
 * ||         | | |                       |||
 * ||         | | |         Slide         |||
 * ||   TOC   | | |                       |||
 * ||         | | +-----------------------+||
 * ||         | | +-----------------------+||
 * ||         | | |         Toolbar       |||
 * ||         | | +-----------------------+||
 * |+---------+ +--------------------------+|
 * +----------------------------------------+
 *
 */
export default function MasterLayout({className, children}) {
  return (
    <div id="exerslide-page" className={className}>
      <TOC togglable={true} />
      <ExtensionPoint tags={['main']}>
        <div id="exerslide-main" className="flex-column">
          {children}
          <Toolbar className="flex-item-fix" />
        </div>
      </ExtensionPoint>
    </div>
  );
}

MasterLayout.propTypes = {
  /**
   * CSS class names to add to the page.
   */
  className: React.PropTypes.string,

  /**
   * The rendered slide is passed as child to the master layout.
   */
  children: React.PropTypes.node,
};
