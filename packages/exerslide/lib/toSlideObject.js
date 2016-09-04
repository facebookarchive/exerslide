/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const frontMatter = require('front-matter');
const getErrorSlideObject = require('./slide_transforms/utils/getErrorSlideObject');
const optionHelper = require('./utils/optionHelper');

/**
 * This function converts the source of a slide file into a JavaScript object.
 * That includes parsing the YAML front matter and producing an error slide
 * object in case the slide options are not valid.
 */
module.exports = function toSlide(content, options) {
  var slide = {};
  if (frontMatter.test(content)) {
    try {
      let fm = frontMatter(content);
      slide.options = fm.attributes;
      slide.content = fm.body;

      const optionsToValidate = [slide.options];
      if (slide.options.defaults) {
        optionsToValidate.push(slide.options.default);
      }

      optionsToValidate.every(o => {
        const validationResult = optionHelper.validateOptions(o);
        if (!validationResult[0]) {
          slide = getErrorSlideObject(
            'Invalid options',
            options.resourcePath,
            new Error(validationResult[1].map(e => e.message).join('\n')),
            content
          );
          return false;
        }
        return true;
      });
    } catch (error) {
      slide = getErrorSlideObject(
        'YAML parse error',
        options.resourcePath,
        error,
        content
      );
    }
  } else {
    slide.options = {};
    slide.content = content;
  }
  return slide;
};
