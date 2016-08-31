/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import ContentRenderer from 'exerslide/components/ContentRenderer';

import './css/Column.css';

const escapeRegex = (function() {
  const PATTERN = /[.*?+[\]{}|\\^$()]/g;
  return str => str.replace(PATTERN, '\\$&');
}());

const columnClasses = ['left', 'center', 'right', 'top', 'middle', 'bottom']
  .reduce((obj, name) => ((obj[name] = 'Column-' + name, obj)), {});

/**
 * This layout renders horizontal columns of text / images.
 *
 * +-----------------------+   +-----------------------+
 * |                       |   |                       |
 * |                       |   |                       |
 * |                       |   |             +------+  |
 * |    Text       Text    |   |    Text     |      |  |
 * |                       |   |             +------+  |
 * |                       |   |                       |
 * |                       |   |                       |
 * +-----------------------+   +-----------------------+
 *
 */
export default function Column({title, layoutData, content}) {
  const {divider='###', alignment=[], position=[]} = layoutData;
  const columns = content
    .split(new RegExp('^' + escapeRegex(divider) + '$', 'm'))
    .map((content, i) => {
      let classNames = [
        'Column-column',
        'Column-' + (i+1),
        columnClasses[alignment[i] || 'left'],
        columnClasses[position[i] || 'top'],
      ];

      return (
        <div key={i} className={classNames.join(' ')}>
          <ContentRenderer value={content} />
        </div>
      );
    });

  return (
    <div>
      {title}
      <div className="Column-wrapper">
        {columns}
      </div>
    </div>
  );
}
