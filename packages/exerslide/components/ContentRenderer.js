/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This component renders the value it receives via props with the content
 * type renderer of the current slide received via context.
 */

import React from 'react';

export default function ContentRenderer({value}, context) {
  return context.slide.contentConverter(value, context);
}

ContentRenderer.propTypes = {
  value: React.PropTypes.string,
};

ContentRenderer.contextTypes = {
  slide: React.PropTypes.object.isRequired,
  slideIndex: React.PropTypes.number.isRequired,
  slides: React.PropTypes.arrayOf(React.PropTypes.object),
  config: React.PropTypes.object.isRequired,
};
