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

import PropTypes from 'prop-types';
import React from 'react';
import ExtensionPoint from 'exerslide/components/ExtensionPoint';
import {forward, back} from 'exerslide/browser';

import './css/toolbar.css';

/**
 * This components generates a previous and next buttons (rendered as arrows,
 * using Font Awesome) to navigate the presentation.
 */
export default function Toolbar({className}, {slideIndex, slides}) {
  const numberOfSlides = slides.length;

  return (
    <ExtensionPoint tags={['toolbar', 'content']}>
      <div
        role="navigation"
        className={'exerslide-toolbar ' + className}
        aria-label="Slide">
        <button
          className="exerslide-toolbar-button"
          type="button"
          aria-label="previous"
          onClick={back}
          disabled={slideIndex === 0}>
          <i className="fa fa-lg fa-chevron-left"></i>
        </button>
        <span
          aria-label={
            'Slide ' + (slideIndex + 1) + ' of ' + numberOfSlides
          }
          className="exerslide-toolbar-text">
          {' ' + (slideIndex + 1) + '/' + numberOfSlides + ' '}
        </span>
        <button
          className="exerslide-toolbar-button"
          type="button"
          aria-label="next"
          onClick={forward}
          disabled={slideIndex + 1 === numberOfSlides}>
          <i className="fa fa-lg fa-chevron-right"></i>
        </button>
      </div>
    </ExtensionPoint>
  );
}

Toolbar.propTypes = {
  className: PropTypes.string,
};

Toolbar.contextTypes = {
  /**
   * This index of the current slide.
   */
  slideIndex: PropTypes.number.isRequired,

  /**
   * Number of slides.
   */
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
};
