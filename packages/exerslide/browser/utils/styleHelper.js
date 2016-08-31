/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

let document = global.document;

/**
 * Creates a style element from the CSS source passed in and adds it to the DOM.
 * It returns a function to remove that element.
 *
 * @param {string} cssText CSS to add to the page
 * @return {function} to remove the element
 */
export function addStyle(cssText) {
  let style = document.createElement('style');
  style.innerHTML = cssText;
  document.head.appendChild(style);
  return {
    remove() {
      if (style) {
        document.head.removeChild(style);
        style = null;
      }
    },
  };
}
