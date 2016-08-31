/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React, {PropTypes, Component} from 'react';
import {normalizeOptions} from './utils/optionHelper';
import {publish} from './pubSub';

/**
 * This component holds the state of the presentation. It doesn't render
 * anything itself but passes functions to mutate state to its child.
 * It also sets up event handlers to update the state from the URL.
 *
 * This component also makes the current slide, the current slide index and the
 * list of files available to all descendants via context.
 */
export default class Store extends Component {
  constructor(props) {
    super(props);
    const slides = normalizeSlides(props.slides);
    this.state = {
      slides,
      slideIndex: getIndexFromURL(slides),
    };

    this.nextSlide = this.nextSlide.bind(this);
    this.previousSlide = this.previousSlide.bind(this);
    this.goToSlide = this.goToSlide.bind(this);
  }

  componentWillMount() {
    global.onhashchange = () => this.goToSlide(
      getIndexFromURL(this.state.slides)
    );
  }

  componentDidMount() {
    const {slides, slideIndex} = this.state;
    publish(
      'SITE.LOADED',
      {
        slide: slides[slideIndex],
        slideIndex,
        slides,
      }
    );
  }

  shouldComponentUpdate(newProps, newState) {
    if (this.props !== newProps) {
      return true;
    }
    return newState.slides !== this.state.slides ||
      newState.slideIndex !== this.state.slideIndex;
  }

  componentDidUpdate() {
    // Update URL
    const {slides, slideIndex} = this.state;
    const slide = slides[slideIndex];
    if (getIndexFromURL(slides) !== slideIndex) {
      global.location.hash = slide.url;
    }
  }

  nextSlide() {
    if (this.state.slideIndex < this.state.slides.length - 1) {
      this.setState({slideIndex: this.state.slideIndex + 1});
    }
  }

  previousSlide() {
    if (this.state.slideIndex > 0) {
      this.setState({slideIndex: this.state.slideIndex - 1});
    }
  }

  goToSlide(slideIndex) {
    if (slideIndex >= this.state.slides.length ||
        slideIndex < 0) {
      return;
    }
    this.setState({slideIndex});
  }

  getChildContext() {
    const {slides, slideIndex} = this.state;
    return {
      slide: slides[slideIndex],
      slideIndex,
      slides,
    };
  }

  render() {
    const {slides, slideIndex} = this.state;
    return React.cloneElement(
      React.Children.only(this.props.children),
      {
        slide: slides[slideIndex],
        slideIndex,
        slides,
        nextSlide: this.nextSlide,
        previousSlide: this.previousSlide,
        goToSlide: this.goToSlide,
      }
    );
  }
}

Store.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.node,
};

Store.childContextTypes = {
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  slide: PropTypes.object,
  slideIndex: PropTypes.number,
};

/**
 * Helper function to convert an ID in the URL to the corresponding slide index.
 */
function getIndexFromURL(slides) {
  const index = global.location.hash.substring(2);
  if (isNaN(index)) {
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].options.id === index) {
        return i;
      }
    }
  }
  return Number(index) || 0;
}

function defaultConverter(x) {
  return x;
}

function normalizeSlides(slides) {
  const defaultOptions = (slides[0].options || {}).defaults;
  slides.forEach((slide, index) => {
    slide.options = normalizeOptions({}, defaultOptions, slide.options);
    slide.url = '#/' + (slide.options.id || index);
    if (!slide.contentConverter) {
      slide.contentConverter = defaultConverter;
    }
  });
  return slides;
}
