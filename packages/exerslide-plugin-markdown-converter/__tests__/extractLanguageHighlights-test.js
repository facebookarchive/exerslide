/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const transformHelper = require('exerslide').transformHelper;
const extractLanguageHighlights = require('../extractLanguageHighlights');
const expect = require('chai').expect;

const helperPath = require.resolve('../utils/registerLanguage');

function test(languages, slide, verify) {
  extractLanguageHighlights({languagePaths: languages})(transformHelper)
    .before(slide, verify);
}

describe('extractLanguageHighlights', () => {

  it('requires language highlights', () => {
    const languages = {
      javascript: './foo',
      markdown: './bar',
    };

    test(
      languages,
      '```javascript\ncode\n```\n\n```markdown\ntext\n```',
      (errors, output, actions) => {
        expect(actions[0].type).to.equal('prefix');

        expect(actions[0].value).to.contain(`require("${helperPath}")`);
        expect(actions[0].value).to.contain('"javascript": require("./foo")');
        expect(actions[0].value).to.contain('"markdown": require("./bar")');
      }
    );
  });

  it('shows an error if language is not found', () => {
    const languages = {
      javascript: './foo',
      markdown: './bar',
    };

    test(
      languages,
      '```foo\ncode\n```\n\n```markdown\ntext\n```',
      (errors, output, actions) => {
        expect(errors.join('')).to.contain('foo');
        expect(actions[0].type).to.equal('prefix');
        expect(actions[0].value).to.contain('"markdown": require("./bar")');
        expect(actions[0].value).to.not.contain('"foo": require(');
      }
    );
  });

});
