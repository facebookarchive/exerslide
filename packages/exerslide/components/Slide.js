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
 * Every slide is rendered through this component (without layout or not).
 *
 * This component contains logic that must be execute for every slide:
 *
 *   - It adds and removes the custom style declarations per slide
 *   - It analyzes the height of the content and shows an alert for screen
 *     readers if there is more content than there is space on the screen.
 *
 */
export default class Slide extends React.Component {
  componentDidMount() {
    this._mountStyle();
    this._mountScript();
    this._updateDocumentTitle();
    publishInternal('SLIDE.DID_MOUNT', this.props);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.slide !== nextProps.slide;
  }

  componentDidUpdate(prevProps) {
    if (this.props.slideIndex !== prevProps.slideIndex) {
      if (this._style) {
        this._style.remove();
        this._style = null;
      }
      if (this._script) {
        this._script.teardown();
        this._script = null;
      }
      this._mountStyle();
      this._mountScript();
      this._updateDocumentTitle();
      publishInternal('SLIDE.DID_UPDATE', this.context);
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
    global.document.title = documentTitlePrefix;
    publishInternal('SLIDE.WILL_UNMOUNT', this.props);
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
    const {slide, slideLayout} = this.props;
    const {options, layout} = this.props.slide;
    const title = options.title ?
      <h1
        id="exerslide-slide-title"
        className="title"
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
            ...this.context,
          }
        ),
      ];
    } else {
      content = [
        title,
        <ContentRenderer value={slide.content} />,
      ];
    }

    // Wrap the content inside the base slide layout
    content = React.createElement(
      slideLayout,
      {},
      ...content
    );

    return (
      <div
        id='exerslide-slide'
        role='main'
        aria-label='Slide:'
        aria-labelledby='exerlide-slide exerlide-slide-title'>
        {content}
      </div>
    );
  }
}

Slide.propTypes = {
  /**
   * The current slide object to render.
   */
  slide: React.PropTypes.object.isRequired,
  /**
   * The index of the slide.
   */
  slideIndex: React.PropTypes.number.isRequired,
  /**
   * The generic layout to use to render this slide.
   */
  slideLayout: React.PropTypes.func.isRequired,
};
