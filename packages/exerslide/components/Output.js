/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

/**
 * A helper component to render the result of something. This makes sure that
 * the result is properly indicated for screen readers.
 *
 * Use this if you e.g. show the rendered output of an HTML snippet as part of
 * your presentation / layout.
 */
export default function Output({label, children, ...props}) {
  return (
    <div
      role="region"
      aria-label={label}
      {...props}>
      {children}
    </div>
  );
}

Output.propTypes = {
  /**
   * Name of the region. Defaults to "Result". Adjust depending on the type of
   * content you present.
   */
  label: React.PropTypes.string,

  children: React.PropTypes.node,
};

Output.defaultProps = {
  label: 'Result',
};
