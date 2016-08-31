/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react'; // eslint-disable-line no-unused-vars

/**
 * Renders HTML slides as HTML.
 */
export default function convert(content) {
  return <div dangerouslySetInnerHTML={{__html: content}} />;
}
