/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {expect} from 'chai';
import {groupByChapter} from '../chapterHelper';

describe('chapterHelper', () => {
  describe('groupByChapter', () => {

    it('groups slide objects by pathHash and chapter property', () => {
      const slides = [
        {options: {chapter: 1}, pathHash: 'foo'},
        {pathHash: 'foo', options: {}},
        {pathHash: 'bar', options: {}},
        {options: {chapter: 2}, pathHash: 'baz'},
        {pathHash: 'baz', options: {}},
      ];

      expect(groupByChapter(slides)).to.deep.equal([
        [{pathHash: 'foo', options: {chapter: 1}}, {pathHash: 'foo', options: {}}],
        {pathHash: 'bar', options: {}},
        [{pathHash: 'baz', options: {chapter: 2}}, {pathHash: 'baz', options: {}}],
      ]);
    });

    it('does not group slides if they do not have chapter or pathHash', () => {
      const slides = [
        {options: {}},
        {options: {}},
        {options: {}},
      ];

      expect(groupByChapter(slides)).to.deep.equal([
        {options: {}},
        {options: {}},
        {options: {}},
      ]);
    });

    it('groups slides with only `chapter`', () => {
      const slides = [
        {options: {chapter: 'A'}},
        {options: {chapter: 'A'}},
        {options: {chapter: 'B'}},
        {options: {}},
      ];

      expect(groupByChapter(slides)).to.deep.equal([
        [{options: {chapter: 'A'}}, {options: {chapter: 'A'}}],
        [{options: {chapter: 'B'}}],
        {options: {}},
      ]);
    });

  });

});
