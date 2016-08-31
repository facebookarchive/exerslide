/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This plugin executes functions when a slide was mounted / unmounted. It can
 * be used by other plugins to execute code in response to a new slide being
 * shown.
 *
 * Usage:
 *
 * import scriptStore, {registerScript} from 'exerslide/browser/plugins/scriptStore';
 *
 * function plugin(exerslide) {
 *   exerslide.use(scriptStore);
 *   // ...
 *   registerScript(
 *     0,
 *     function() { console.log('first slide shown'); },
 *     function() { console.log('goodbye'); }
 *   );
 * }
 */
const scriptStore = {};

export default function plugin(exerslide) {
  exerslide.subscribe('SLIDE.DID_MOUNT', ({slideIndex, slide}) => {
    if (scriptStore[slideIndex]) {
      const scripts = scriptStore[slideIndex];
      for (let i = 0; i < scripts.length; i+=2) {
        scripts[i]({slideIndex, slide});
      }
    }
  });

  exerslide.subscribe('SLIDE.DID_UPDATE', ({slideIndex, slide}) => {
    if (scriptStore[slideIndex]) {
      const scripts = scriptStore[slideIndex];
      for (let i = 1; i < scripts.length; i+=2) {
        scripts[i+1]({slideIndex, slide});
        scripts[i]({slideIndex, slide});
      }
    }
  });

  exerslide.subscribe('SLIDE.WILL_UNMOUNT', ({slideIndex, slide}) => {
    if (scriptStore[slideIndex]) {
      const scripts = scriptStore[slideIndex];
      for (let i = 1; i < scripts.length; i+=2) {
        scripts[i]({slideIndex, slide});
      }
    }
  });
}

/**
 * This functions registers functions to be executed when a slide mounted and
 * gets unmounted.
 *
 * @param {number} slideIndex The slide for which these functions should be
 *   executed.
 *
 * @param {function} setup The function that should be executed when the slide
 *   gets mounted.
 *
 * @param {function} teardown The function that should be executed when the
 *   slide is unmounted. This should basically undo anything that the setup
 *   function created.
 */
export function registerScript(slideIndex, setup, teardown) {
  if (!scriptStore[slideIndex]) {
    scriptStore[slideIndex] = [];
  }
  scriptStore[slideIndex].push(setup, teardown);
}
