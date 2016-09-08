/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jsdom = require('jsdom').jsdom;

global.document = jsdom('');
global.window = global.document.defaultView;
Object.keys(global.document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = global.document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
};

// The .babelrc file in the parent directory is configured to only be used in
// the "exerslide-test" environment. This prevents Babel from picking up this
// config when running webpack (which results in errors)
process.env.BABEL_ENV = 'exerslide-test';
