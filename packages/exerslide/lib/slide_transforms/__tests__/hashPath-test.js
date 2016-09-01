/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const hashPath = require('../hashPath');
const expect = require('chai').expect;

describe('hashPath', () => {

  it('assigns the same hash for slides in the same folder', () => {
    let hashes = [];
    function callback(error, slide) {
      hashes.push(slide.pathHash);
    }

    const transformer = hashPath({});

    transformer.after({}, callback, {resourcePath: './foo/bar'});
    transformer.after({}, callback, {resourcePath: './foo/baz'});
    transformer.after({}, callback, {resourcePath: './foo'});

    expect(hashes[0]).to.equal(hashes[1]);
    expect(hashes[1]).to.not.equal(hashes[2]);
  });

});
