/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Presentation from './Presentation';
import React from 'react';
import ReactDOM from 'react-dom';
import Store from './Store';
import {publish} from './pubSub';

/**
 * This is the main (internal) entry point. It connects the data store with
 * the presentation logic. It receives a configuration object with various
 * settings for the presentation. Currently supported are
 *
 *  - masterLayout: A React component that defines the whole page. A default
 *    version is copied into the project folder upon initialization.
 *  - slideLayout: A React component that defines the base structure of a slide.
 *    A default version is also copied into the project folder.
 *  - slides: An array of slide objects.
 *  - ...: Other options for plugins, such as content converters can be added.
 *
 * @param {Object} config Object with various configuration options.
 */
export default function present(config) {
  validateConfig(config);

  // This allows plugins to get a reference to the configuration object and
  // make changes to it before it used by exerslide.
  publish('CONFIG.SET', config);

  // The default index.html shows a loading indicator. If we find it, we remove
  // it.
  const loader = global.document.getElementById('exerslide-loader');
  if (loader) {
    loader.parentNode.removeChild(loader);
  }
  ReactDOM.render(
    <Store slides={config.slides}>
      <Presentation
        masterLayout={config.masterLayout}
        slideLayout={config.slideLayout}
        config={config}
      />
    </Store>,
    global.document.body.appendChild(
      global.document.createElement('div')
    )
  );
}

const configValidation = {
  slides: 'You have to pass an array of slides.',
  masterLayout: 'You have to pass a master layout.',
  slideLayout: 'You have to pass a slide layout',
};

function validateConfig(config) {
  Object.keys(configValidation).forEach(prop => {
    if (!(prop in config)) {
      throw new Error(configValidation[prop]);
    }
  });
}
