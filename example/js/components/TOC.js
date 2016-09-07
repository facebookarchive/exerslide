/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/*
 * This hash helps exerslide to determine whether the file needs to be updated
 * or not. Please don't remove it.
 * @exerslide-file-hash eaf77b7603e0e0c989660d4049c126ad
 */

import React from 'react';
import * as exerslide from 'exerslide/browser';
const {groupByChapter, IS_MOBILE} = exerslide;

import './css/toc.css';

/**
 * An entry in the Table of Contents
 */
class Entry extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.slideIndex !== this.props.slideIndex ||
      nextProps.active !== this.props.active;
  }

  componentDidUpdate() {
    if (this.props.active) {
      this.refs.anchor.focus();
    }
  }

  render() {
    const {slideIndex, slides, active} = this.props;
    const slide = slides[slideIndex];
    const slideOptions = slide.options;
    let classes = ['exerslide-toc-entry'];
    const layout = slide.layout;
    if (layout && layout.getClassNames) {
      classes = classes.concat(layout.getClassNames(slideIndex, exerslide));
    }
    const title = slideOptions.toc || slideOptions.title ||
      `Slide ${slideIndex + 1}`;
    const props = {};
    if (active) {
      classes.push('active');
      props['aria-current'] = 'page';
    }

    return (
      <li className={classes.join(' ')}>
        <a
          {...props}
          ref="anchor"
          tabIndex={active ? 0 : -1}
          title={title}
          href={slide.url}>
          <span className="title">{title}</span>
        </a>
      </li>
    );
  }
}

Entry.propTypes = {
  slideIndex: React.PropTypes.number,
  slides: React.PropTypes.array,
  active: React.PropTypes.bool,
};

/**
 * The Table of Contents functions as overview over the content as well as
 */

export default class TOC extends React.Component {
  constructor(props, context) {
    super(props, context);
    const slideOptions = context.slide.options;
    let collapsed = false;
    if (props.togglable) {
      // On mobile devices we collapse the TOC by default
      if (IS_MOBILE) {
        collapsed = true;
      } else if (slideOptions.hasOwnProperty('hideTOC')) {
        collapsed = slideOptions.hideTOC;
      }
    }
    this.state = {
      groupedSlides: groupByChapter(context.slides),
      collapsed,
      explicitlyToggled: false,
    };
    this._onToggle = this._onToggle.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextContext.slides !== this.context.slides) {
      this.setState({groupedSlides: groupByChapter(nextContext.slides)});
    }
    if (nextContext.slide !== this.context.slide) {
      const slideOptions = nextContext.slide.options;
      if (!this.state.explicitlyToggled) {
        let collapsed = IS_MOBILE ? true : Boolean(slideOptions.hideTOC);
        this.setState(
          {
            collapsed,
          },
          () => this.props.onToggle(!this.state.collapsed)
        );
      }
    }
  }

  _onToggle() {
    this.setState(
      {
        collapsed: !this.state.collapsed,
        explicitlyToggled: true,
      },
      () => this.props.onToggle(!this.state.collapsed)
    );
  }

  render() {
    let slideIndex = 0;
    const {togglable} = this.props;
    const {slides} = this.context;
    const {collapsed} = this.state;
    const chapters = this.state.groupedSlides.map(chapter => {
      let entry;
      if (Array.isArray(chapter)) {
        const isActive = this.context.slideIndex >= slideIndex &&
          this.context.slideIndex < slideIndex + chapter.length;
        entry = chapter.map((slide, index) =>
          <Entry
            key={slideIndex + index}
            slideIndex={slideIndex + index}
            slides={slides}
            active={this.context.slideIndex === slideIndex + index}
          />
        );
        entry =
          <li
            key={chapter[0].options.chapter}
            className={'exerslide-toc-chapter' + (isActive ? ' active' : '')}>
            <h3 className="exerslide-toc-heading">
              {chapter[0].options.chapter}
            </h3>
            <ol className="exerslide-toc-entries">{entry}</ol>
          </li>;
        slideIndex += chapter.length;
      } else {
        entry =
          <Entry
            key={slideIndex}
            slideIndex={slideIndex}
            slides={slides}
            active={this.context.slideIndex === slideIndex}
          />;
        slideIndex += 1;
      }
      return entry;
    });

    const icon =
      <i
        className={'fa fa-lg ' + (collapsed ? 'fa-bars' : 'fa-chevron-left')}
        aria-hidden={true}
      />;

    return (
      <div
        role="navigation"
        className={'exerslide-toc-container' + (collapsed ? ' collapsed' : '')}>
        <h2
          id="exerslide-toc-title"
          className="exerslide-toc-title">
          Table of Contents
        </h2>
        {togglable ?
          /* This goes against the code formatting guidelines because VoiceOver
           * is not able to announce this button properly if there is a line
           * break in it.
           */
          <button
            className="exerslide-toc-toggleButton"
            type="button"
            aria-controls="exerslide-toc-list"
            aria-expanded={!collapsed}
            aria-label="Table of Contents"
            onClick={this._onToggle}>{icon}</button> :
          null
        }
        <ol
          id="exerslide-toc-list"
          className="exerslide-toc-list"
          aria-controls="main"
          aria-labelledby="exerrslide-toc-title">
          {chapters}
        </ol>
      </div>
    );
  }
}

TOC.propTypes = {
  /**
   * Whether to show a toggle button or not.
   */
  togglable: React.PropTypes.bool,

  /**
   * Callback called when TOC is shown or hidden.
   */
  onToggle: React.PropTypes.func,
};

TOC.contextTypes = {
  /**
   * Current slide.
   */
  slide: React.PropTypes.object,

  /**
   * Index of the currently shown slide.
   */
  slideIndex: React.PropTypes.number,

  /**
   * All slides.
   */
  slides: React.PropTypes.array,
};

TOC.defaultProps = {
  onToggle: () => {},
};
