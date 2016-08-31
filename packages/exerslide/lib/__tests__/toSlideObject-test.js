/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const expect = require('chai').expect;
const toSlideObject = require('../toSlideObject');

describe('toSlideObject', () => {

  it('converts slide content to a JS object', () => {
    expect(toSlideObject('---\n_foo: bar\n---\nbaz')).to.deep.equal({
      options: {_foo: 'bar'},
      content: 'baz',
    });
  });

  it('accepts slides without content', () => {
    expect(toSlideObject('---\n_foo: bar\n---')).to.deep.equal({
      options: {_foo: 'bar'},
      content: '',
    });
  });

  it('accepts slides without fron matter', () => {
    expect(toSlideObject('baz')).to.deep.equal({
      options: {},
      content: 'baz',
    });
  });

  it('returns an error slide if the front matter cannot be parsed', () => {
    const slide = toSlideObject('---\n_foo: bar: baz\n---', {});
    expect(slide.options.layout).to.equal('__ExerslideError__');
  });

});
