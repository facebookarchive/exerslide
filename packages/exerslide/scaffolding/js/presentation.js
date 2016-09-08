// @remove-on-copy-start
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// @remove-on-copy-end
/*
 * This hash helps exerslide to determine whether the file needs to be updated
 * or not. Please don't remove it.
 * @exerslide-file-hash
 */

/**
 * This is the JavaScript entry point to the presentation.
 * This file allows you to customize some aspects of the presentation, such
 * as the master layout to use (if you don't want to edit the default one),
 * or which keyboard bindings to use for navigation, or to perform any other
 * kind of custom initialization step.
 */

import {present, use} from 'exerslide/browser';

/**
 * The master layout for this presentation. To customize is, either edit it
 * directly or copy it and point to the copy here.
 */
import MasterLayout from './MasterLayout';

/**
 * The base slide layout. To customize is, either edit it directly or copy it
 * and point to the copy here.
 */
import SlideLayout from './SlideLayout';

/**
 * Many features of exerslide are actually made available via runtime plugins.
 *
 * The following plugin enables keyboard navigation. This sets up the default
 * keybindings for a presentation. This should be an object with
 * `keys -> function` mapping. exerslide will bind event handlers for those keys
 * (key combinations) and call the corresponding function providing an API to
 * control the presentation. Currently provided is
 *
 * - nextSlide(): Advance to the next slide
 * - previousSlide(): Go back to the previous slide
 *
 * We use https://craig.is/killing/mice to bind the event handlers. Have
 * a look at the documentation to find out how to specify key combinations.
 */
import keyboardNavigation from 'exerslide/browser-plugins/keyboardNavigation';
function forward({forward}) {
  forward();
}

function back({back}) {
  back();
}
use(
  keyboardNavigation,
  {
    left: back,
    right: forward,
    'alt+pageup': back,
    'alt+pagedown': forward,
  }
);

/**
 * This plugin automatically scales the font size according to the provided
 * settings. The default settings try to maintain a line length that is
 * considered to be readable. To disable this plugin, just comment or remove the
 * following two lines.
 */
import scaledContent from 'exerslide/browser-plugins/scaledContent';
use(scaledContent);

/**
 * This plugin, when applied to content, injects alerts for screenreaders that
 * let the author know if the content isn't fully visible. That allows authors
 * with visual impairment to adjust the content or to scroll to make the content
 * visible.
 */
import contentVisibility from 'exerslide/browser-plugins/contentVisibility';
use(contentVisibility);

/**
 * This plugin is only enabled during development and shows the file path of the
 * current slide and allows to view the source of the slide.
 */
import debugInformation from 'exerslide/browser-plugins/debugInformation';
use(debugInformation);

/**
 * It is likely that you will be linking to the same external sources from
 * multiple slides. By default exerslide provides the references.yml file as a
 * central place to keep those references. The default markdown parser takes
 * them into account.
 */
import references from '!!json!yaml!../references.yml';

/**
 * __exerslide_slides__ is "magic" global variable that holds an array of slide
 * objects. By default this variable is injected by webpack. You could use
 * to perform additional modifications to the slides.
 */
/* global __exerslide_slides__*/

present({
  masterLayout: MasterLayout,
  slideLayout: SlideLayout,
  references,
  slides: __exerslide_slides__,
});
