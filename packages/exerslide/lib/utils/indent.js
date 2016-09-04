/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Prepend any line in the string by `indent`.
 */
module.exports = function indent(message, indent, first) {
  message = message
    .split('\n')
    .map(line => indent + line)
    .join('\n');
  return first ? message.replace(indent, first) : message;
}

