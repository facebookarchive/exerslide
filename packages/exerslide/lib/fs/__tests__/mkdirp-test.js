/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const expect = require('chai').expect;
const mkdirp = require('../mkdirp');
const testUtils = require('../../../scripts/test-utils');

describe('mkdirp', () => {

  it('generates nested folders', done => {
    const dir = testUtils.makeDirectoryStructure({});

    mkdirp(dir + '/foo/bar/baz')
      .then(
        () => {
          testUtils.validateFolderStructure(dir, {foo: {bar: {baz: {}}}});
          done();
        },
        () => {
          expect(true).to.equal(false);
          done();
        }
      )
      .then(null, error => done(error));
  });

});
