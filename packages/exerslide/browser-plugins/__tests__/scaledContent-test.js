/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import 'jsdom';
import React from 'react';
import scaledContent from '../scaledContent';
import {expect} from 'chai';
import {mount} from 'enzyme';

function run(config, slides, fn) {
  scaledContent(
    {
      subscribe: (_, cb) => cb({slides}),
      registerExtension: fn,
    },
    config
  );
}

describe('browser-plugin/scaledContent', () => {
  const dE = document.documentElement;

  beforeEach(() => {
    dE.clientWidth = 1000;
    dE.style.fontSize = '10px';
  });

  it('sets the font size of the document root', () => {
    dE.style.fontSize = '10px';
    dE.clientWidth = 1400;
    run(null, [], () => {
      expect(dE.style.fontSize).to.not.equal('10px');
    });
  });

  it('scales the font size according to the config', () => {
    // At 1n initial 0px font size and 30em per line => content width 300px
    // At 1000px viewport width, 300px is only 30% (0.3)
    // If we want a column width of 600px (60%, 0.6), the font size must be
    // 600 / 30 = 20px

    run({contentWidth: 30, columnWidth: 0.6}, [], () => {
      expect(dE.style.fontSize).to.equal('20px');
    });
  });

  it('scales the font size according to the options in the first slide', () => {
    run(
      null,
      [{options: {scale: {contentWidth: 30, columnWidth: 0.6}}}],
      () => {
        expect(dE.style.fontSize).to.equal('20px');
      }
    );
  });

  it('favors slide settings over config', () => {
    run(
      {columnWith: 0.9},
      [{options: {scale: {contentWidth: 30, columnWidth: 0.6}}}],
      () => {
        expect(dE.style.fontSize).to.equal('20px');
      }
    );
  });

  it('respects the max font size setting', () => {
    run(
      {maxFontSize: 16.4, contentWidth: 30, columnWidth: 0.6},
      [],
      () => {
        expect(dE.style.fontSize).to.equal('16.4px');
      }
    );

    dE.style.fontSize = '10px';

    run(
      null,
      [{
        options: {
          scale: {maxFontSize: 16.4, contentWidth: 30, columnWidth: 0.6},
        },
      }],
      () => {
        expect(dE.style.fontSize).to.equal('16.4px');
      }
    );
  });

  it('doesn\'t scale if false is passed', () => {
    run(
      false,
      [],
      () => {
        expect(dE.style.fontSize).to.equal('10px');
      }
    );

    run(
      null,
      [{options: {scale: false}}],
      () => {
        expect(dE.style.fontSize).to.equal('10px');
      }
    );
  });

  it('doesn\'t scale if the viewport is smaller than the content', () => {
    dE.clientWidth = 250; // < 30em * 10px
    run(
      {conentWidth: 30},
      [],
      () => {
        expect(dE.style.fontSize).to.equal('10px');
      }
    );
  });

  it('doesn\'t scale if the font size is smaller than the the intial font size', () => {
    dE.style.fontSize = '25px';
    run(
      {contentWidth: 30, columnWidth: 0.6},
      [],
      () => {
        expect(dE.style.fontSize).to.equal(''); // reset to blank
      }
    );
  });

  it('sets the max-width of the wrapped component', () => {
    run(
      {contentWidth: 50},
      [],
      Component => {
        const root = mount(<Component><div /></Component>);
        expect(root.contains(<div style={{maxWidth: '50em'}} />)).to.be.true;
      }
    );

    run(
      null,
      [{options: {scale: {contentWidth: 42}}}],
      Component => {
        const root = mount(<Component><div /></Component>);
        expect(root.contains(<div style={{maxWidth: '42em'}} />)).to.be.true;
      }
    );
  });

  it('merges the style prop', () => {
    // The following simulates the <ExtensionPoint /> behavior, namely passing
    // the style prop from the wrapped component
    run(
      {contentWidth: 50},
      [],
      Component => {
        const root = mount(
          <Component style={{color: 'red'}}>
            <div />
          </Component>
        );
        expect(root.contains(<div style={{color: 'red', maxWidth: '50em'}} />))
          .to.be.true;
      }
    );
  });

  it('passes along other props', () => {
    // The following simulates the <ExtensionPoint /> behavior, namely passing
    // the style prop from the wrapped component
    run(
      {contentWidth: 50},
      [],
      Component => {
        const root = mount(
          <Component id="foo">
            <div />
          </Component>
        );
        expect(root.contains(<div id="foo" style={{maxWidth: '50em' }} />))
          .to.be.true;
      }
    );
  });

});
