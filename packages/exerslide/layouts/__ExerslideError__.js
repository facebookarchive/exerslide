/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

import './css/__exerslideError__.css';

/**
 * This is a special layout that is used when the front matter of a slide cannot
 * be properly parsed. Instead of only showing an error on the command line, we
 * also render a slide that contains the error message and the relevant part of
 * the slide source.
 */
export default function __ExerslideError__({title, layoutData}) {
  const {error, source, filePath} = layoutData;
  return (
    <div>
      {title}
      <p>The slide <code>{filePath}</code> could not be processed:</p>
      <pre className="exerslide-callout">
        {error.message}
      </pre>
      {source ?
        <div>
          <h2>Full source</h2>
          <pre><code>{source}</code></pre>
        </div> :
        null
      }
    </div>
  );
}

__ExerslideError__.getClassNames = () => '__exerslide-error__';
