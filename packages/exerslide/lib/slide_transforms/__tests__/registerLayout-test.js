/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const registerLayout = require('../registerLayout');
const expect = require('chai').expect;

function run(layouts, slideLayout, slideExtension, defaultLayouts, verify) {
  registerLayout({layouts, defaultLayouts}).after(
    {
      options: {
        layout: slideLayout,
      },
    },
    verify,
    {
      resourcePath: './slide' + slideExtension,
    }
  );
}

function testSuccess(
  layouts,
  slideLayout,
  slideExtension,
  defaultLayouts,
  expectedPath
) {
  run(layouts, slideLayout, slideExtension, defaultLayouts, (error, slide, actions) => {
    // Verify that path gets required
    expect(actions[0].type).to.equal('import');
    expect(actions[0].request).to.equal(expectedPath);

    // Verify that the imported value gets assigned to layout.
    expect(actions[1].propertyPath).to.equal('layout');
    expect(actions[1].value).to.equal(actions[0].id);
  });
}

function testError(layouts, slideLayout, slideExtension, defaultLayouts, verify) {
  run(layouts, slideLayout, slideExtension, defaultLayouts, error => {
    expect(error).to.satisfy(verify);
  });
}

describe('registerLayout', () => {
  it('uses "layout" if available', () => {
    const layouts = {
      plugin1: {
        center: './path/foo',
      },
      plugin2: {
        twocolumn: './path/bar',
      },
    };

    testSuccess(layouts, 'Center', '.md', null, './path/foo');
    testSuccess(layouts, 'TwoColumn', '.md', null, './path/bar');
  });

  it('considers plugin name if provided', () => {
    const layouts = {
      plugin1: {
        center: './path/foo',
      },
      plugin2: {
        center: './path/bar',
      },
    };

    testSuccess(layouts, 'plugin1:Center', '.md', null, './path/foo');
    testSuccess(layouts, 'plugin2:Center', '.md', null, './path/bar');
  });

  it('uses default layouts if available', () => {
    const layouts = {
      plugin1: {
        center: './path/foo',
      },
      plugin2: {
        twocolumn: './path/bar',
      },
    };
    const defaultLayouts = {
      '.md': 'Center',
      '.foo.md': 'TwoColumn',
    };

    testSuccess(layouts, null, '.md', defaultLayouts, './path/foo');
    testSuccess(layouts, null, '.foo.md', defaultLayouts, './path/bar');
  });

  it('errors if there is no matching layout', () => {
    testError({}, 'Test', '.md', null, error => {
      return error.includes('Unknown layout');
    });
  });

  it('errors if there are multiple matching layouts', () => {
    const layouts = {
      plugin1: {
        center: './foo/bar',
      },
      plugin2: {
        center: './foo/baz',
      },
    };
    testError(layouts, 'Center', '.html', null, error => {
      return error.includes('Found multiple layouts');
    });
  });

  it('ignores case for layout names', () => {
    const layouts = {
      plugin1: {
        center: './foo/bar',
      },
    };
    testSuccess(layouts, 'CENTER', '.html', null, './foo/bar');
  });

});
