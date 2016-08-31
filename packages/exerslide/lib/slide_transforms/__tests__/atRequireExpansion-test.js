/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const atRequireExpansion = require('../atRequireExpansion');
const expect = require('chai').expect;

function test(input, verify) {
  atRequireExpansion({}).before(input, verify);
}

describe('atRequireExpansion', () => {

  it('replaces @require with require calls', () => {
    test(
      'This is @require("./a/test") with @require(./paths).',
      (errors, output, actions) => {
        expect(output).to.equal(
          `This is ${actions[0].search} with ${actions[1].search}.`
        );
        expect(actions).to.deep.equal([
          {
            type: 'interpolate',
            search: actions[0].search,
            value: 'require(\"./a/test\")',
          },
          {
            type: 'interpolate',
            search: actions[1].search,
            value: 'require(\"./paths\")',
          },
        ]);
      }
    );
  });

});
