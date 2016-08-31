/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const requireAssets = require('../requireAssets');
const expect = require('chai').expect;
const temp = require('temp').track();
const path = require('path');

const assetFile = temp.openSync({suffix: '.png'}).path;
const slideFile = temp.openSync({dir: path.dirname(assetFile)}).path;

function test(input, verify, options) {
  requireAssets(options || {}).before(
    input,
    verify,
    {resourcePath: slideFile}
  );
}

describe('requireAssets', () => {

  it('replaces asset paths with require calls', () => {
    test(
      `foo: ./${path.basename(assetFile)}`,
      (errors, output, actions) => {
        expect(output).to.equal(`foo: ${actions[0].search}`);
        expect(actions).to.deep.equal([
          {
            type: 'interpolate',
            search: actions[0].search,
            value: `require(\"./${path.basename(assetFile)}\")`,
          },
        ]);
      }
    );
  });

  it('does not replace paths that do not exist', () => {
    test(
      'This is a test: ./foo.png',
      (errors, output, replacements) => {
        expect(output).to.equal('This is a test: ./foo.png');
        expect(replacements).to.be.empty;
        expect(errors.length).to.equal(1);
      }
    );
  });

  it('accepts a custom pattern', () => {
    test(
      `foo: --./${path.basename(assetFile)}--`,
      (errors, output, actions) => {
        expect(output).to.equal(`foo: ${actions[0].search}`);
        expect(actions).to.deep.equal([
          {
            type: 'interpolate',
            search: actions[0].search,
            value: `require(\"./${path.basename(assetFile)}\")`,
          },
        ]);
      },
      {pattern: /--(.+)--/}
    );
  });

});
