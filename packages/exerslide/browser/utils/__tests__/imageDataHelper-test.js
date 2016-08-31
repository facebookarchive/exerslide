/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {expect} from 'chai';
import {normalizeImageData} from '../imageDataHelper';

function testAll(tests) {
  let called = 0;
  tests.forEach(test => {
    test();
    called += 1;
  });
  expect(called).to.equal(tests.length);
}

describe('imageDataHelper', () => {

  describe('normalizeImageData', () => {

    it('normalizes file paths', () => {
      testAll(
        ['foo.png', './foo.png', '/foo.png', 'bar/foo.png'].map(
          p => () => expect(normalizeImageData(p)).to.deep.equal({src: p})
        )
      );
    });

    it('does not accept names without file extension', () => {
      testAll(
        ['foo', 'foo.', 'foo. bar', './foo.'].map(
          p => () => expect(normalizeImageData(p)).to.be.null
        )
      );
    });

    it('accepts HTTP URLs', () => {
      testAll(
        ['http://foo.bar', 'https://foo.bar'].map(
          p => () => expect(normalizeImageData(p)).to.deep.equal({src: p})
        )
      );
    });

    it('returns image objects as is', () => {
      let img = {src: 'foo.png'};
      expect(normalizeImageData(img)).to.equal(img);
    });

    it('does not accept values without src property', () => {
      expect(normalizeImageData({bar: 'foo'})).to.be.null;
      expect(normalizeImageData('foo')).to.be.null;
      expect(normalizeImageData(null)).to.be.null;
    });

  });

});
