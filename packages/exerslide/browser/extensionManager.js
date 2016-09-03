/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {publish} from './pubSub';

/**
 * This module is the counter part to the <ExtensionPoint> component. The
 * registerExtension method is available to plugins so that the can specify
 * which components to render at extension points.
 */

const components = [];
const validModes = ['before', 'after', 'wrap', 'replace'];

/**
 * Returns the list of components that have been registered for the list of
 * tags.
 *
 * @param {Array<string>} tags A list of tag names
 * @return {Array<{component: Component, mode: string, tags: Array<string>}>}
 */
export function getRegisteredExtensions(tags) {
  const tagMap = tags.reduce((map, t) => (map[t] = true, map), {});

  return components.filter(component => {
    return component.tags.some(t => tagMap[t]);
  });
}

/**
 * Registers a component to be rendered for the specified extension points.
 *
 * `component` is a React component.
 * `mode` is one of "before", "after", "wrap" or "replace" that specifies how
 * the component is inserted into the extension point.
 * `tags` specifies where the component should be inserted. It will be inserted
 * into any extension point that is assigned a tag in that list.
 *
 * @param {Component} component The component to render
 * @param {string} mode How to insert the component
 * @param {Array<string>} tags Where to render the component
 */
export function registerExtension(component, mode, tags) {
  if (validModes.indexOf(mode) === -1) {
    throw new Error(`"${mode}" is not a valid mode for an extension.`);
  }
  let obj = {component, tags, mode};
  components.push(obj);

  // This informs the <ExtensionPoint> instances to rerender
  publish('EXTENSIONS.UPDATE');
  return function() {
    if (obj) {
      components.splice(components.indexOf(obj), 1);
      obj = null;
      publish('EXTENSIONS.UPDATE');
    }
  };
}

/**
 * This function "unregisters" all components. Only used in test.
 */
export function clearAll_FOR_TESTS() {
  components.length = 0;
}
