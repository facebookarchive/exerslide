/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import {subscribe} from '../browser/pubSub';
import {getRegisteredExtensions} from '../browser/extensionManager';

/**
 * This is a "magical" component. It allows plugins to influence what content
 * is rendered without having to know where exactly it will end up on the page.
 * As long as instances of this component are available in the master layout,
 * slide layout and other components, plugins will be able to extend the content.
 *
 * How it works:
 * Very similiar to a pubsub pattern. Every extension point has a list of tags
 * that categorizes it. A single tag will probably be most common. Example:
 * page, content.
 * Plugins can register components to render for specific tags. Then, whenever
 * an extension point renders, it will log for all registered components for
 * tag and render them.
 * Components can be rendered with different modes that define where they should
 * be rendered in relation to the extension point. Currently supported are:
 *
 *   - wrap: Put the content of the extension point inside the component
 *   - before: Put the component as first child of the extension point.
 *   - after: Put the component as last child of the extension point.
 *   - replace: Replace the content of the extension point
 *
 * Multiple components for the same tag are rendered in the order they have been
 * registered.
 *
 * Any additional props are forwarded to every component that is rendered.
 */

export default class ExtensionPoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      components: getGroupedComponents(props.tags),
    };
  }

  componentDidMount() {
    this._unsubscribe = subscribe('EXTENSIONS.UPDATE', () => {
      const components = getGroupedComponents(this.props.tags);
      if (shouldUpdate(this.state.components, components)) {
        this.setState({components});
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    const {components} = this.state;
    const defaultProps = {
      slide: this.context.slide,
      slideIndex: this.context.slideIndex,
      slides: this.context.slides,
    };


    if (components.replace) {
      // We cannot assume that wrapping components should be applied to the
      // replaced content so we return here directly. If there is more than
      // component that performs a replacement, the last one wins.
      return React.createElement(
        components.replace[components.replace.length - 1],
        defaultProps
      );
    }

    let container = this.props.children ?
      React.Children.only(this.props.children) :
      <div />;

    if (components.before || components.after) {
      const children = [];
      if (components.before) {
        children.push(
          ...components.before.map(c => React.createElement(c, defaultProps))
        );
      }
      children.push(container.props.children);
      if (components.after) {
        children.push(
          ...components.after.map(c => React.createElement(c, defaultProps))
        );
      }
      container = React.cloneElement(
        container,
        {},
        ...children
      );
    }

    if (components.wrap) {
      /**
       * If we have multiple wrappers, we have to properly thread the
       * properties of the wrapped component through them.
       * Lets say we have two wrappers, then the component tree looks something
       * like this:
       *
       * <Wrapper2>----------------+
       * | <Wrapper1-------------+ |
       * | | <div style={...} /> | |
       * | +---------------------+ |
       * +-------------------------+
       *
       * Wrapper1 can easily inject new style values while preserving the div's
       * style prop by accessing child.props.style.
       *
       * Wrapper2 however doesn't have access to this prop. To be able to merge
       * new values into the div's prop, we have to pass the props of the inner
       * component to the outermost component.
       *
       * Every wrapper has to pass additional props down to its child so that
       * the (possibly augmented) original props reach the inner component.
       */
      const innerProps = container.props;
      container = components.wrap
        .slice(0, -1)
        .reduce((container, component) => {
          return React.createElement(
            component,
            defaultProps,
            container
          );
        }, container);
      return React.createElement(
        components.wrap[components.wrap.length - 1],
        {
          ...defaultProps,
          ...innerProps,
        },
        container
      );
    }

    return container;
  }
}

ExtensionPoint.propTypes = {
  tags: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  children: React.PropTypes.node,
};

ExtensionPoint.contextTypes = {
  slide: React.PropTypes.object.isRequired,
  slideIndex: React.PropTypes.number.isRequired,
  slides: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

function getGroupedComponents(tags) {
  const result = {};
  getRegisteredExtensions(tags).forEach(({component, mode}) => {
    if (!result[mode]) {
      result[mode] = [];
    }
    result[mode].push(component);
  });
  return result;
}

function shouldUpdate(a, b) {
  return Object.keys(a).concat(Object.keys(b)).some(
    key => !a[key] ||
           !b[key] ||
           a[key].length !== b[key].length ||
           a[key].some((v, i) => v !== b[key][i])
  );
}
