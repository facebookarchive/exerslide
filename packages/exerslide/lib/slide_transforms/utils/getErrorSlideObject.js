/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/**
 * Helper function to create a slide object representing an error slide.
 *
 * @param {string} title Title of the file
 * @param {string} filePath The (relative) path to the file
 * @param {Error} error The error object
 * @param {string} source The raw source of the slide
 *
 * @return {Object}
 */
module.exports = function(title, filePath, error, source) {
  return {
    options: {
      title: 'Slide generation error: ' + title,
      toc: 'Slide generation error',
      layout: '__ExerslideError__',
      style: '',
      layout_data: {
        filePath,
        source,
        error,
      },
    },
  };
};
