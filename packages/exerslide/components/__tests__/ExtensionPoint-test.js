/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import {expect} from 'chai';
import {shallow, mount} from 'enzyme';
import 'jsdom';
import ExtensionPoint from '../ExtensionPoint';
import {registerExtension, clearAll_FOR_TESTS as clear} from '../../browser/extensionManager';

describe('<ExtensionPoint />', () => {
  const context = {
    slide: {},
    slideIndex: 0,
    slides: [],
  };

  beforeEach(clear);

  it('renders without children', () => {
    const root = shallow(<ExtensionPoint tags={['test']} />, {context});
    expect(root.matchesElement(<div />)).to.be.true;
  });

  it('renders its child if no wrapper is defined', () => {
    const inner = <div id="inner" />;
    const root = shallow(
      <ExtensionPoint tags={['test']}>
        {inner}
      </ExtensionPoint>,
      {context}
    );
    expect(root.get(0)).to.equal(inner);
  });

  it('renders before extensions', () => {
    const Extension1 = () => {};
    const Extension2 = () => {};

    registerExtension(Extension1, 'before', ['test']);
    registerExtension(Extension2, 'before', ['test']);

    const root = shallow(
      <ExtensionPoint tags={['test']}>
        <div id="inner">Content</div>
      </ExtensionPoint>,
      {context}
    );
    expect(root.matchesElement(
      <div id="inner">
        <Extension1 />
        <Extension2 />
        Content
      </div>
    )).to.be.true;
  });

  it('renders after extensions', () => {
    const Extension1 = () => {};
    const Extension2 = () => {};

    registerExtension(Extension1, 'after', ['test']);
    registerExtension(Extension2, 'after', ['test']);

    const root = shallow(
      <ExtensionPoint tags={['test']}>
        <div id="inner">Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(
      <div id="inner">
        Content
        <Extension1 />
        <Extension2 />
      </div>
    )).to.be.true;
  });

  it('renders wrapper extensions', () => {
    const Wrapper1 = () => {};
    const Wrapper2 = () => {};

    registerExtension(Wrapper1, 'wrap', ['test']);
    registerExtension(Wrapper2, 'wrap', ['test']);

    const root = shallow(
      <ExtensionPoint tags={['test']}>
        <div id="inner">Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(
      <Wrapper2 {...context}>
        <Wrapper1 {...context}>
          <div id="inner">
            Content
          </div>
        </Wrapper1>
      </Wrapper2>
    )).to.be.true;
  });

  it('renders replace extensions', () => {
    const Replacer = () => <div id="replaced" />

    registerExtension(Replacer, 'replace', ['test']);

    const root = shallow(
      <ExtensionPoint tags={['test']}>
        <div id="inner">Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(<Replacer {...context} />)).to.be.true;
  });

  it('passes container props to the wrapper', () => {
    const Wrapper = () => {};
    const props = {prop1: 0, prop2: 1};

    registerExtension(Wrapper, 'wrap', ['test']);

    const root = shallow(
      <ExtensionPoint tags={['test']}>
        <div {...props}>Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(
      <Wrapper {...props} {...context}>
        <div>
          Content
        </div>
      </Wrapper>
    )).to.be.true;
  });

  it('threads props through the tree (if wrappers comply)', () => {
    const Wrapper1 = ({children, ...props}) => {
      const {slide, slideIndex, slides, style, ...restProps} = props; // eslint-disable-line no-unused-vars
      return React.cloneElement(
        React.Children.only(children),
        {
          ...restProps,
          style: {...style, fontSize: 1},
          'data-wrapper1': true,
        }
      );
    };
    const Wrapper2 = ({children, ...props}) => {
      const {slide, slideIndex, slides, style, ...restProps} = props; // eslint-disable-line no-unused-vars
      return React.cloneElement(
        React.Children.only(children),
        {
          ...restProps,
          style: {...style, lineHeight: 2},
          'data-wrapper2': true,
        }
      );
    };

    registerExtension(Wrapper1, 'wrap', ['test']);
    registerExtension(Wrapper2, 'wrap', ['test']);

    let root = shallow(
      <ExtensionPoint tags={['test']}>
        <div style={{display: 'none'}}>Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(
      <Wrapper2 style={{display: 'none'}}>
        <Wrapper1>
          <div>
            Content
          </div>
        </Wrapper1>
      </Wrapper2>
    )).to.be.true;

    root = root.find(Wrapper2).shallow();
    expect(root.matchesElement(
      <Wrapper1 style={{display: 'none', lineHeight: 2}} data-wrapper2={true}>
        <div>
          Content
        </div>
      </Wrapper1>
    )).to.be.true;

    root = root.find(Wrapper1).shallow();
    expect(root.matchesElement(
      <div
        style={{display: 'none', lineHeight: 2, fontSize: 1}}
        data-wrapper2={true}
        data-wrapper1={true}>
        Content
      </div>
    )).to.be.true;
  });

  it('renders components only for specified tags', () => {
    const Extension1 = () => {};
    const Extension2 = () => {};
    const Extension3 = () => {};

    registerExtension(Extension1, 'after', ['first']);
    registerExtension(Extension2, 'after', ['second']);
    registerExtension(Extension3, 'before', ['third']);

    const root = shallow(
      <ExtensionPoint tags={['first', 'third']}>
        <div>Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.matchesElement(
      <div>
        <Extension3 />
        Content
        <Extension1 />
      </div>
    )).to.be.true;
  });

  it('updates when a new component is registered', () => {
    const Extension1 = () => <div id="1" />;
    const Extension2 = () => <div id="2" />;

    registerExtension(Extension1, 'after', ['test']);

    const root = mount(
      <ExtensionPoint tags={['test']}>
        <div>Content</div>
      </ExtensionPoint>,
      {context}
    );

    expect(root.contains(<div id="1" />)).to.be.true;

    registerExtension(Extension2, 'before', ['test']);

    root.update();
    expect(root.contains(<div id="1" />)).to.be.true;
    expect(root.contains(<div id="2" />)).to.be.true;
  });
});
