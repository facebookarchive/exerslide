/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as navigation from './navigation';
import React from 'react';
import Slide from '../components/Slide';
import {subscribe} from './pubSub';

/**
 * This component receives the state mutation methods from the store and reacts
 * to navigation events. It notifies the current slide about the events and only
 * notifies the store if the slide doesn't handle it.
 *
 * It also passes the configuration object to all descendants via context.
 */
export default class Presentation extends React.Component {
  componentDidMount() {
    subscribe(
      navigation.FORWARD,
      () => {
        const handled = this._slide && this._slide.onForward();
        if (!handled) {
          this.props.nextSlide();
        }
      }
    );
    subscribe(
      navigation.BACK,
      () => {
        const handled = this._slide && this._slide.onBack();
        if (!handled) {
          this.props.previousSlide();
        }
      }
    );
    subscribe(
      navigation.TO_SLIDE,
      index => this.props.goToSlide(index)
    );
  }

  getChildContext() {
    return {
      config: this.props.config,
    };
  }

  render() {
    const {
      masterLayout,
      slideLayout,
      slide,
      slideIndex,
      slides,
    } = this.props;

    const options = slide.options;
    const layout = slide.layout;
    let classNames = options.classNames ?
      [...options.classNames] :
      [];
    if (layout && layout.getClassNames) {
      classNames = classNames.concat(
        layout.getClassNames({slides, slideIndex, slide})
      );
    }

    return React.createElement(
      masterLayout,
      {
        className: classNames.join(' '),
      },
      <Slide
        key={slideIndex}
        ref={ref => this._slide = ref}
        slide={slide}
        slideIndex={slideIndex}
        slideLayout={slideLayout}
      />
    );
  }
}

Presentation.propTypes = {
  masterLayout: React.PropTypes.func,
  slideLayout: React.PropTypes.func,
  slide: React.PropTypes.object,
  slideIndex: React.PropTypes.number,
  slides: React.PropTypes.arrayOf(React.PropTypes.object),
  config: React.PropTypes.object,
  nextSlide: React.PropTypes.func,
  previousSlide: React.PropTypes.func,
  goToSlide: React.PropTypes.func,
};

Presentation.childContextTypes = {
  config: React.PropTypes.object,
};
