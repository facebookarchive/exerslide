/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// ES6 imports don't seem to work properly with this module
const Mousetrap = require('mousetrap');

/**
 * Allows the visitor to navigate the presentation / tutorial with the keyboard.
 * See https://craig.is/killing/mice to learn how to specify key combinations.
 *
 * The plugin expects an object with `key -> function` mappings. A navigation
 * object is passed to the functions.
 *
 * Usage:
 *
 * import keyboardNavigation from 'exerslide/browser-plugins/keybordNavigation';
 * exerslide.use(
 *   keyboardNavigation,
 *   {
 *     right: nav => nav.forward()
 *     left: nav => nav.back()
 *   }
 * );
 */
export default function keyboardNavigation(exerslide, keyMap) {
  const {forward, back} = exerslide;
  const navigation = {forward, back};

  exerslide.subscribe('SITE.LOADED', () => {
    Object.keys(keyMap).forEach(prop => {
      Mousetrap.bind(prop, () => keyMap[prop](navigation));
    });
  });
}
