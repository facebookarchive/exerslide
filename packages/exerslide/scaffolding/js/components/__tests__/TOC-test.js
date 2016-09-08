/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import TOC from '../TOC';

describe('TOC', () => {

  const slides = [
    {
      options: {
        title: 'First slide',
      },
    },
    {
      options: {
        title: 'Long Title Slide 2',
        toc: 'shorter title',
      },
    },
    {
      options: {},
    },
  ];
  const context = {slides, slideIndex: 0, slide: slides[0]};

  it('renders an entry for each slide', () => {
    const root = mount(
      <TOC />,
      {context}
    );
    expect(root.find('.exerslide-toc-entry')).to.have.length(3);
  });

  it('adds a class to the active entry', () => {
    const root = mount(
      <TOC />,
      {context}
    );
    expect(root.find('.exerslide-toc-entry').at(0).hasClass('active'))
      .to.be.true;

    root.setContext({slides, slideIndex: 2, slide: slides[2]});
    const entries = root.find('.exerslide-toc-entry');
    expect(entries.at(0).hasClass('active'))
      .to.be.false;
    expect(entries.at(2).hasClass('active'))
      .to.be.true;
  });

  it('uses the `toc` options if present', () => {
    const root = mount(
      <TOC />,
      {context}
    );
    const entries = root.find('.exerslide-toc-entry');
    expect(entries.at(1).text()).to.equal('shorter title');
  });

  it('uses a default title for slides without `title` and `toc`', () => {
    const root = mount(
      <TOC />,
      {context}
    );
    const entries = root.find('.exerslide-toc-entry');
    expect(entries.at(2).text()).to.equal('Slide 3');
  });

  it('groups slides by chapters', () => {
    const slides = [
      {options: {chapter: 'A'}},
      {options: {chapter: 'A'}},
      {options: {chapter: 'B'}},
      {options: {}},
    ];
    const root = mount(
      <TOC />,
      {context: {slides, slideIndex: 1, slide: slides[1]}}
    );
    const entries = root.find('.exerslide-toc-entry');
    const chapters = root.find('.exerslide-toc-chapter');
    expect(entries).to.have.length(4);
    expect(chapters).to.have.length(2);

    // First chapter has 2 entries
    expect(chapters.at(0).find('.exerslide-toc-entry')).to.have.length(2);
    // Active chapter has class
    expect(chapters.at(0).hasClass('active')).to.be.true;
    // Chapter entry shows chapter name
    expect(chapters.at(0).find('.exerslide-toc-heading').text()).to.equal('A');

    // Second chapter has 1 entry
    expect(chapters.at(1).find('.exerslide-toc-entry')).to.have.length(1);
    expect(chapters.at(1).find('.exerslide-toc-heading').text()).to.equal('B');
  });

  it('renders the class names returnd the slides layout', () => {
    let called = false;
    function getClassNames(args) {
      called = true;
      // Method gets passed current context
      expect(args.slides).to.equal(slides);
      expect(args.slideIndex).to.equal(1);
      expect(args.slide).to.equal(slides[1]);
      return ['foo'];
    }
    const slides = [
      {options: {}},
      {options: {}, layout: {getClassNames}},
    ];

    const root = mount(
      <TOC />,
      {context: {slides, slideIndex: 0, slide: slides[0]}}
    );
    const entry = root.find('.exerslide-toc-entry').at(1);

    // layout method was called
    expect(called).to.be.true;
    // returned class name is added to entry
    expect(entry.hasClass('foo')).to.be.true;
  });
});
