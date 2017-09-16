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

import PropTypes from 'prop-types';

export default function ContentRenderer({value}, context) {
  return context.slide.contentConverter(value, context);
}

ContentRenderer.propTypes = {
  value: PropTypes.string,
};

ContentRenderer.contextTypes = {
  slide: PropTypes.object.isRequired,
  slideIndex: PropTypes.number.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object),
  config: PropTypes.object.isRequired,
};
