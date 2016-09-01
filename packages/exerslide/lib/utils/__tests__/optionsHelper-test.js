/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const expect = require('chai').expect;
const validateOptions = require('../optionHelper').validateOptions;

describe('optionHelper', () => {

  it('errors on `id:`s containing /', () => {
    expect(validateOptions({id: 'foo/bar'})[0]).to.equal(false);
    expect(validateOptions({id: 'foo_bar'})[0]).to.equal(true);
  });

  it('errors if `style:` is not a string', () => {
    expect(validateOptions({style: 123})[0]).to.equal(false);
    expect(validateOptions({style: 'abc'})[0]).to.equal(true);
  });

  it('errors if `class_names:` is not an array', () => {
    expect(validateOptions({class_names: 'foo bar'})[0]).to.equal(false);
    expect(validateOptions({class_names: ['foo', 'bar']})[0]).to.equal(true);
  });

  it ('disables unkown options', () => {
    expect(validateOptions({foo: 'bar'})[0]).to.equal(false);
  });

  it ('allows unkown options starting with "_" (private options)', () => {
    expect(validateOptions({_foo: 'bar'})[0]).to.equal(true);
  });

  it ('recommends similiarly named options', () => {
    const result = validateOptions({layoutdata: {}});
    expect(result[1][0].message).to.contain('layoutdata');
    expect(result[1][0].message).to.contain('layout_data');
  });

  describe('scale', () => {

    it('errors if `scale:` is not a boolean or an object', () => {
      expect(validateOptions({scale: 123})[0]).to.equal(false);
      expect(validateOptions({scale: false})[0]).to.equal(true);
      expect(validateOptions({scale: true})[0]).to.equal(true);
      expect(validateOptions({scale: {}})[0]).to.equal(true);
    });

    it('errors if `scale.content_width:` is not an integer', () => {
      expect(validateOptions({scale: {content_width: 'abc'}})[0])
        .to.equal(false);
      expect(validateOptions({scale: {content_width: 5.3}})[0])
        .to.equal(false);
      expect(validateOptions({scale: {content_width: 5}})[0])
        .to.equal(true);
    });

    it('errors if `scale.column_width:` is not a value between (0,1]', () => {
      expect(validateOptions({scale: {column_width: -1}})[0])
        .to.equal(false);
      expect(validateOptions({scale: {column_width: 0}})[0])
        .to.equal(false);
      expect(validateOptions({scale: {column_width: 0.5}})[0])
        .to.equal(true);
      expect(validateOptions({scale: {column_width: 1}})[0])
        .to.equal(true);
      expect(validateOptions({scale: {column_width: 1.1}})[0])
        .to.equal(false);
    });

  });

  describe('default values', () => {

    it('accepts specific options as default options', () => {
      const defaultOptions = {
        'class_names': [],
        'hide_toc': false,
      };

      expect(validateOptions({defaults: defaultOptions})[0]).to.equal(true);
    });

    it('disallows other options as default values', () => {
      const defaultOptions = {
        'layout_data': [],
      };

      expect(validateOptions({defaults: defaultOptions})[0]).to.equal(false);
    });

  });

});
