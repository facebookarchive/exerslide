/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const registerContentType = require('../registerContentType');
const expect = require('chai').expect;

function run(converters, slideContentType, slideExtension, verify) {
  registerContentType({converters}).after(
    {
      options: {
        content_type: slideContentType,
      },
    },
    verify,
    {
      resourcePath: './slide' + slideExtension,
    }
  );
}

function testSuccess(
  converters,
  slideContentType,
  slideExtension,
  expectedPath
) {
  run(converters, slideContentType, slideExtension, (error, slide, actions) => {
    // Verify that path gets required
    expect(actions[0].type).to.equal('import');
    expect(actions[0].request).to.equal(expectedPath);

    // Verify that the imported value gets assigned to contentType.
    expect(actions[1].propertyPath).to.equal('contentConverter');
    expect(actions[1].value).to.equal(actions[0].id);
  });
}

function testError(converters, slideContentType, slideExtension, verify) {
  run(converters, slideContentType, slideExtension, error => {
    expect(error).to.satisfy(verify);
  });
}

describe('registerContentType', () => {

  it('chooses content types based on file extension', () => {
    const contentTypes = {
      plugin1: {
        text_html: './path/foo',
      },
      plugin2: {
        'text_x-markdown': './path/bar',
      },
    };

    testSuccess(contentTypes, null, '.md', './path/bar');
  });

  it('uses contentType if available', () => {
    const contentTypes = {
      plugin1: {
        text_html: './path/foo',
      },
      plugin2: {
        'text_x-markdown': './path/bar',
      },
    };

    testSuccess(contentTypes, 'text/html', '.md', './path/foo');
    testSuccess(contentTypes, 'text/x-markdown', '.html', './path/bar');
  });

  it('considers plugin name if provided', () => {
    const contentTypes = {
      plugin1: {
        text_html: './path/foo',
      },
      plugin2: {
        text_html: './path/bar',
      },
    };

    testSuccess(contentTypes, 'plugin1:text/html', '.md', './path/foo');
    testSuccess(contentTypes, 'plugin2:text/html', '.md', './path/bar');
  });

  it('errors if there is no matching plugin', () => {
    testError({}, null, '.md', error => {
      return error.includes('Unknown content type');
    });
  });

  it('errors if there are multiple matching converters', () => {
    const converters = {
      plugin1: {
        text_html: './foo/bar',
      },
      plugin2: {
        text_html: './foo/baz',
      },
    };
    testError(converters, null, '.html', error => {
      return error.includes('Found multiple content type converters');
    });
  });

});
