/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import {addStyle} from '../browser/utils/styleHelper';
import {evalScript} from '../browser/utils/scriptHelper';
import {publish} from '../browser/pubSub';
import ContentRenderer from './ContentRenderer';

let documentTitlePrefix = null;

function publishInternal(event, data) {
  publish(event, data);
}

/**
 * Every slide is rendered through this component (without layout or not). It
 * contains logic that must be execute for every slide, such as rendering the
 * custom styles.
 *
 * Note that this component could also be used to render a slide object other
 * than the one currently selected. Whether that's the case is determined by
 * comparing the passed in data with the context data.
 */
export default class Slide extends React.Component {
  componentDidMount() {
    this._mountStyle();
    this._mountScript();
    this._updateDocumentTitle();
    publishInternal('SLIDE.DID_MOUNT', this.getChildContext());
  }

  shouldComponentUpdate(nextProps, _nextState, nextContext) {
    const isActive = this._isActive(this.props, this.context);
    return this.props.slide !== nextProps.slide ||
      this.props.slideIndex !== nextProps.slideIndex ||
       // slide becomes active or inactive
      isActive !== (this.props.slide === nextContext.slide);

  }

  componentDidUpdate(prevProps, _prevState, prevContext) {
    const isActive = this._isActive(this.props, this.context);
    const wasActive = this._isActive(prevProps, prevContext);
    const childContext = this.getChildContext();

    if (this.props.slideIndex !== prevProps.slideIndex ||
        isActive !== wasActive) {
      if (this._style) {
        this._style.remove();
        this._style = null;
      }
      if (this._script) {
        this._script.teardown();
        this._script = null;
      }
      if (wasActive) {
        publishInternal('SLIDE.INACTIVE', childContext);
      }

      this._mountStyle();
      this._mountScript();
      if (isActive) {
        this._updateDocumentTitle();
        publishInternal('SLIDE.ACTIVE', childContext);
      }
      publishInternal('SLIDE.DID_UPDATE', childContext);
    }
  }

  componentWillUnmount() {
    if (this._style) {
      this._style.remove();
      this._style = null;
    }
    if (this._script) {
      this._script.teardown();
      this._script = null;
    }
    if (this._isActive(this.props, this.context)) {
      global.document.title = documentTitlePrefix;
    }
    publishInternal('SLIDE.WILL_UNMOUNT', this.getChildContext());
  }

  getChildContext() {
    return {
      slide: this.props.slide,
      slideIndex: this.props.slideIndex,
      slides: this.context.slides,
    };
  }

  _isActive(props, context) {
    return props.slideIndex === context.slideIndex;
  }

  _updateDocumentTitle() {
    const title = this.props.slide && this.props.slide.options.title;
    if (documentTitlePrefix === null) {
      // first initialization
      documentTitlePrefix = global.document.title;
    }
    global.document.title = title ?
      documentTitlePrefix + ' - ' + title :
      documentTitlePrefix;
  }

  _mountStyle() {
    if (this._style) {
      this._style.remove();
      this._style = null;
    }
    if (this.props.slide.options.style) {
      this._style = addStyle(this.props.slide.options.style);
    }
  }

  _mountScript() {
    if (this._script) {
      this._script.teardown();
      this._script = null;
    }
    const script = this.props.slide.options.script;
    if (script) {
      this._script = evalScript(script);
      this._script.setup();
    }
  }

  onForward() {
    return Boolean(
      this._layout &&
      this._layout.onForward &&
      this._layout.onForward()
    );
  }

  onBack() {
    return Boolean(
      this._layout &&
      this._layout.onBack &&
      this._layout.onBack()
    );
  }

  render() {
    const {slide, slideIndex, slideLayout} = this.props;
    const {options, layout} = this.props.slide;
    const idSuffix = '-' + (options.id || slideIndex);
    const title = options.title ?
      <h1
        id={`exerslide-slide-title${idSuffix}`}
        className="exerslide-slide-title"
        tabIndex={0}>
        {options.title}
      </h1> :
      null;

    let content;

    if (layout) {
      content = [
        React.createElement(
          layout,
          {
            ref: ref => this._layout = ref,
            title,
            content: slide.content,
            layoutData: options.layoutData || {},
            ...this.getChildContext(),
          }
        ),
      ];
    } else {
      content = [
        title,
        <ContentRenderer value={slide.content} />,
      ];
    }
    const isActive = this._isActive(this.props, this.context);

    // Wrap the content inside the base slide layout
    content = React.createElement(
      slideLayout,
      {
        slide,
        slideIndex,
        isActive,
      },
      ...content
    );

    return (
      <div
        id={`exerslide-slide${idSuffix}`}
        aria-label={'Slide:'}
        aria-labelledby={`exerslide-slide${idSuffix} exerslide-slide-title${idSuffix}`}
        role={isActive ? 'main' : null}
        className='exerslide-slide'>
        {content}
      </div>
    );
  }
}

Slide.propTypes = {
  /**
   * The slide object to render.
   */
  slide: React.PropTypes.object.isRequired,
  /**
   * The index of the slide that is rendered.
   */
  slideIndex: React.PropTypes.number.isRequired,
  /**
   * The generic layout to use to render this slide.
   */
  slideLayout: React.PropTypes.func.isRequired,
};

Slide.contextTypes = {
  /**
   * The current (i.e. active) slide object.
   */
  slide: React.PropTypes.object.isRequired,
  /**
   * The index of the active slide.
   */
  slideIndex: React.PropTypes.number.isRequired,
  /**
   * The index of the active slide.
   */
  slides: React.PropTypes.arrayOf(React.PropTypes.object),
};

/**
 * We are going to override whatever context values we get from the root with
 * the data received via props so that descendants work with the correct data.
 */
Slide.childContextTypes = {
  /**
   * The current (i.e. active) slide object.
   */
  slide: React.PropTypes.object.isRequired,
  /**
   * The index of the active slide.
   */
  slideIndex: React.PropTypes.number.isRequired,
  /**
   * The index of the active slide.
   */
  slides: React.PropTypes.arrayOf(React.PropTypes.object),
};
