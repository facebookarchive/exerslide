/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import CodeMirror from 'codemirror';

import 'codemirror/lib/codemirror.css';
import './css/editor.css';

/**
 * Editor component which uses CodeMirror.
 *
 * This implementation takes care of keyboard navigation while inside the editor
 * and provides the possibility to switch to a simpler editor (textarea) which
 * makes it easier for screen reader users to interact with it.
 */
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this._toggleEditor = this._toggleEditor.bind(this);
    this._onChange = this._onChange.bind(this);
    this.state = {
      showTextarea: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let textareaDOMNode = this.refs.textarea;
    if (this.state.showTextarea && !prevState.showTextarea) {
      textareaDOMNode.value = this.codeMirror.getValue();
      textareaDOMNode.focus();
    } else if (!this.state.showTextarea && prevState.showTextarea) {
      this.codeMirror.setValue(textareaDOMNode.value);
      this.codeMirror.focus();
    }
  }

  componentDidMount() {
    this.codeMirror = CodeMirror( // eslint-disable-line new-cap
      this.refs.cm,
      {
        mode: this.props.mode,
        value: this.props.defaultValue,
        lineNumbers: true,
        inputStyle: 'contenteditable',
        ...this.props.config,
      }
    );

    this.codeMirror.getInputField().setAttribute('aria-multiline', 'true');

    if (this.props.onChange) {
      this.codeMirror.on('change', this._onChange);
    }

    // For unknown reasons, Firefox generates a "keypress" event when Tab is
    // pressed, but only for exerslide content. I was unable to reproduce the
    // issue with CodeMirror or React alone.
    //
    // This keypress event causes CodeMirror to insert an invalid character
    // instead of ignoring the event and tabbing away from the content (if
    // tabbing is disabled in the configuration)
    //
    // Since it is the normal browser behavior to *not* generate a keypress
    // event, we can safely prevent it.
    if (global.document.body.addEventListener) {
      let wrapper = this.codeMirror.getWrapperElement();
      wrapper.addEventListener(
        'keypress',
        event => {
          if (event.keyCode === 9) { // Tab
            event.stopPropagation();
          }
        },
        true
      );
    }

    let textareaDOMNode = this.refs.textarea;
    if (this.props.onChange) {
      textareaDOMNode.oninput = this._onChange;
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  _onChange() {
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => this.props.onChange(this.getValue()),
      200
    );
  }

  _toggleEditor() {
    this.setState({
      showTextarea: !this.state.showTextarea,
    });
  }

  render() {
    let buttonTitle = this.state.showTextarea ?
      'Use code editor' :
      'Use simple editor';

    return (
      <div
        className={'editor ' + this.props.className || ''}
        role="region"
        style={this.props.style}
        aria-label={this.props.label}>
        <button
          className="editor-toggle-button"
          title={buttonTitle}
          aria-label={buttonTitle}
          onClick={this._toggleEditor}>
          <span className="fa fa-exchange" />
        </button>
        <textarea
          ref="textarea"
          name="simple editor"
          className="CodeMirror"
          style={{display: this.state.showTextarea ? 'block': 'none'}}
          defaultValue=""
        />
        <div
          ref="cm"
          style={{
            height: '100%',
            display: this.state.showTextarea ? 'none': 'block',
          }}
        />
      </div>
    );
  }

  reset() {
    this.codeMirror.setValue(this.props.defaultValue);
  }

  getValue() {
    return this.state.showTextarea ?
      this.refs.textarea.value :
      this.codeMirror.getValue();
  }

  setValue(value) {
    if (this.state.showTextarea) {
      this.refs.textarea.value = value;
    } else {
      this.codeMirror.setValue(value);
    }
  }
}

Editor.propTypes = {
  /**
   * Configuration options to pass to the CodeMirror instance.
   */
  config: React.PropTypes.object,
  /**
   * Additional classes to add to the editor.
   */
  className: React.PropTypes.string,
  /**
   * The initial value to show in the editor.
   */
  defaultValue: React.PropTypes.string,
  /**
   * The syntax mode to use/
   */
  mode: React.PropTypes.string,
  /**
   * Whether the text in the editor can be edited or not.
   */
  readOnly: React.PropTypes.bool,
  /**
   * Called whenever the editor value changes. Gets passed the new value.
   */
  onChange: React.PropTypes.func,
  /**
   * Aria label to use for the editor
   */
  label: React.PropTypes.string,
  /**
   * Custom CSS styles
   */
  style: React.PropTypes.object,
};

Editor.defaultProps = {
  label: 'Editor',
  config: {},
  defaultValue: '',
  readOnly: false,
};
