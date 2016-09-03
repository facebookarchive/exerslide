/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

/**
 * This plugin wraps the node at the extension point and measures how much of it
 * is visible on the screen. If the node has more content than is visible, it
 * injects an alert for screenreaders to announce how much of the content is
 * visible.
 *
 * Usage:
 *
 * import contentVisibility from 'exerslide/browser-plugins/contentVisibility';
 * exerslide.use(contentVisibility);
 */
export default function contentVisibility(exerslide) {
  exerslide.registerExtension(
    Visibility,
    'wrap',
    ['a11y-announce-content']
  );
}

const style = {
  position: 'absolute',
  display: 'block',
  left: '-10000px',
  width: '0px',
  height: '0px',
};

function getBottomPadding(node) {
  const computedStyle = global.getComputedStyle(node);
  return parseInt(computedStyle.paddingBottom);
}

function throttle(func, timeout=150) {
  let timer;
  const throttled = function() {
    if (!timer) {
      timer = setTimeout(() => {
        func.call(this);
        timer = null;
      }, timeout);
    }
  };
  throttled.cancel = () => clearTimeout(timer);
  return throttled;
}

class Visibility extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contentOverflow: false,
    };

    this.analyze = throttle(
      this._analyzeContentHeight.bind(this)
    );
  }

  componentDidMount() {
    global.addEventListener('resize', this.analyze);
    global.addEventListener('zoom', this.analyze);
    this.analyze();
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.analyze);
    global.removeEventListener('zoom', this.analyze);
    this.analyze.cancel();
  }

  _analyzeContentHeight() {
    if (!this._node) {
      return;
    }

    const contentHeight =
      this._node.scrollHeight - getBottomPadding(this._node);
    const containerHeight = this._node.clientHeight;

    if (containerHeight < (contentHeight - 10)) {
      const percentage = Math.round((containerHeight / contentHeight) * 100);
      this.setState({
        contentOverflow: percentage,
      });
    } else {
      this.setState({
        contentOverflow: false,
      });
    }
  }

  render() {
    const {
      children,
      slide: _slide,
      slideIndex: _slideIndex,
      slides: _slides,
      ...restProps,
    } = this.props;

    const announcement = this.state.contentOverflow ?
      <span
        style={style}
        tabIndex={0}
        role="alert">
        {`Attention: Only ${this.state.contentOverflow}% of the slide
          content is visible`}
      </span> :
      null;
    let child = React.Children.only(children);

    return React.cloneElement(
      child,
      {
        ...restProps,
        ref: ref => {
          this._node = ref;
          if (typeof child.ref === 'function') {
            child.ref(ref);
          }
        },
      },
      announcement,
      child.props.children
    );
  }
}

Visibility.propTypes = {
  /**
   * The node whose height should be measured.
   */
  children: React.PropTypes.node,
  slide: React.PropTypes.object,
  slideIndex: React.PropTypes.number,
  slides: React.PropTypes.arrayOf(React.PropTypes.object),
};
