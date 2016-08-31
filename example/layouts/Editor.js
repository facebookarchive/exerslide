import Editor from 'exerslide/components/Editor';
import React from 'react';
import Output from 'exerslide/components/Output';

import 'codemirror/mode/htmlmixed/htmlmixed';

/**
 * Example layout that uses an editor
 */
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.content,
    };

    this._onChange = this._onChange.bind(this);
  }

  _onChange(value) {
    this.setState({
      value,
    });
  }

  render() {
    return (
      <div>
        {this.props.title}
        <Editor
          ref="editor"
          label="HTML code editor"
          mode="htmlmixed"
          defaultValue={this.props.content}
          onChange={this._onChange}
        />
        <Output label="Rendered HTML">
          <div dangerouslySetInnerHTML={{__html: this.state.value}} />
        </Output>
      </div>
    );
  }
}
