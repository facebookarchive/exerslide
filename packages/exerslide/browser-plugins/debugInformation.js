/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

/**
 * During development, this plugin shows the file path to the current slide
 * and allows you to toggle between source view and rendered output.
 *
 * Usage:
 *
 *   import debugInformation from 'exerslide/browser/plugins/debugInformation';
 *   exerslide.use(debugInformation)
 */
export default function debugInformation(exerslide) {
  if (!__DEV__) {
    return;
  }
  exerslide.registerExtension(
    props => (
      <DebugToolbar
        {...props}
        registerExtension={exerslide.registerExtension}
      />
    ),
    'before',
    ['main']
  );
}

const toolbarStyle = {
  backgroundColor: '#EEE',
  boxSizing: 'border-box',
  fontSize: '1rem',
  padding: '0.5em',
  width: '100%',
  position: 'relative',
  textAlign: 'center',
  display: 'flex',
};

const codeStyle = {
  overflow: 'visible',
  overflowX: 'auto',
};

/**
 * This component shows the file path of the slide, if it is available.
 */
class DebugToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSource: false,
    };
    this._toggleSource = this._toggleSource.bind(this);
  }

  _toggleSource() {
    const isSourceShown = this.state.showSource;

    if (isSourceShown) {
      this._unregister();
    } else {
      this._unregister = this.props.registerExtension(
        ({slide}) => (
          <pre style={{overflow: 'visible', display: 'block'}}>
            <code style={codeStyle}>{slide.__source__}</code>
          </pre>
        ),
        'replace',
        ['slide']
      );
    }
    this.setState({showSource: !isSourceShown});
  }

  render() {
    const slide = this.props.slide;
    if (!slide.__path__) {
      return null;
    }

    const buttonLabel = (this.state.showSource ? 'Hide' : 'Show') + ' Source';

    return (
      <div
        role="region"
        aria-label="File path of current slide"
        style={toolbarStyle}
        className="flex-item-fix">
        <span style={{flexGrow: 2}}>
          File path: {slide.__path__}
        </span>
        <button onClick={this._toggleSource} aria-label={buttonLabel}>
          {this.state.showSource ?
            <i className="fa fa-times" aria-hidden={true} /> :
            <i
              className="fa fa-file-code-o"
              aria-hidden={true}
              title={buttonLabel}
            />
          }
        </button>
      </div>
    );
  }
}

DebugToolbar.propTypes = {
  registerExtension: React.PropTypes.func,
  slide: React.PropTypes.object,
};
