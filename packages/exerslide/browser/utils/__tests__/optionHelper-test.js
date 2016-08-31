/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {expect} from 'chai';
import {normalizeOptions} from '../optionHelper';

describe('optionHelper', () => {

  describe('normalizeOptions', () => {

    it('renames snake case to camel case', () => {
      const options = {
        layout_data: {},
        hide_toc: true,
        class_names: [],
        content_type: {},
        scale: {
          content_width: '',
          column_width: '',
          max_font_size: '',
        },
      };

      expect(normalizeOptions(options)).to.deep.equal({
        layoutData: {},
        hideTOC: true,
        classNames: [],
        contentType: {},
        scale: {
          contentWidth: '',
          columnWidth: '',
          maxFontSize: '',
        },
      });
    });

    it('merges class_names', () => {
      const options = [
        {title: 'first', class_names: ['foo']},
        {title: 'second', class_names: ['bar']},
      ];

      expect(normalizeOptions(...options)).to.deep.equal({
        title: 'second',
        classNames: ['foo', 'bar'],
      });
    });

  });

});
