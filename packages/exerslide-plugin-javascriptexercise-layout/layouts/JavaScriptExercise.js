/* eslint no-new-func: 0, new-cap: 0*/
import ContentRenderer from 'exerslide/components/ContentRenderer';
import {setSlideCacheData, getSlideCacheData} from 'exerslide/browser';
import Editor from 'exerslide/components/Editor';
import React from 'react';

import chai from 'chai';
import classnames from 'classnames';
import withoutComments from '../js/withoutComments';

import 'codemirror/mode/javascript/javascript';

const CACHE_KEY = 'exerslide-plugin-javascriptexercise-layout';

let defautExerciseData = {
  completed: false,
  error: null,
  code: '',
};

function createAssertion(code) {
  return new Function('assert, source, output', code);
}

function clone(...args) {
  return Object.assign({}, ...args);
}

function log() {
  console.log.apply(console, arguments); // eslint-disable-line no-console
}
global.log = log;

export default class JavaScriptExercise extends React.Component {

  static getClassNames({slideIndex}) {
    let exercise = getSlideCacheData(slideIndex, CACHE_KEY);
    return classnames({
      JavascriptExercise: true,
      completed: exercise && exercise.completed,
      error: exercise && exercise.error,
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      exercise: getSlideCacheData(
        props.slideIndex,
        CACHE_KEY,
        defautExerciseData
      ),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.slideIndex !== this.props.slideIndex) {
      return true;
    }
    const thisExercise = this.state.exercise;
    const nextExercise = nextState.exercise;
    return thisExercise.completed !== nextExercise.completed ||
      thisExercise.error !== nextExercise.error;
  }

  componentDidUpdate(prevProps) {
    if (this.props.slideIndex !== prevProps.slideIndex) {
      // Update the value of the editor
      this.refs.editor.setValue(this.state.exercise.code || this.props.content);
    }
  }

  reset() {
    this.refs.editor.setValue(this.props.content);
    const exercise = clone(
      this.state.exercise,
      {
        completed: false,
        error: '',
      }
    );
    setSlideCacheData(
      this.props.slideIndex,
      CACHE_KEY,
      exercise
    );
    this.setState({exercise});
  }

  runCode() {
    let code = this.refs.editor.getValue();
    let func = new Function('log, console', code);
    func(log, console);
  }

  submitCode() {
    const code = this.refs.editor.getValue();
    const assertion = createAssertion(this.props.layoutData.assertion);
    const output = [];
    let {exercise} = this.state;
    try {
      let func = new Function('log, console', code);
      let realLog = console.log; // eslint-disable-line no-console
      let log = function log() {
        output.push.apply(output, arguments);
        realLog.apply(console, arguments);
      };
      console.log = log; // eslint-disable-line no-console
      func(log, console);
      console.log = realLog; // eslint-disable-line no-console
      assertion(chai.assert, withoutComments(code), output);

      exercise = clone(exercise, {error: '', completed: true});
    } catch (ex) {
      const error = ex.name + ': ' + ex.message;
      exercise = clone(exercise, {error, completed: false});
      console.error(error); // eslint-disable-line no-console
    }
    setSlideCacheData(
      this.props.slideIndex,
      CACHE_KEY,
      exercise
    );
    this.setState({exercise});
  }

  _onChange(code) {
    let exercise = clone(this.state.exercise, {code});
    setSlideCacheData(
      this.props.slideIndex,
      CACHE_KEY,
      exercise
    );
    this.setState({exercise});
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      exercise: getSlideCacheData(
        newProps.slideIndex,
        CACHE_KEY,
        defautExerciseData
      ),
    });
  }

  render() {
    const {title} = this.props;
    const exercise = this.state.exercise;
    let {assertion, description} = this.props.layoutData;
    if (description) {
      description = <ContentRenderer value={description} />;
    }

    let message;
    if (exercise.completed) {
      message =
        <div className="callout success">
          <strong>Well done!</strong>
        </div>;
    } else if (exercise.error) {
      message =
        <div className="callout alert">
          <strong>Oh no :(</strong><br />
          {exercise.error}
        </div>;
    }
    return (
      <div className="JavaScriptExercise">
        {title}
        {description}
        <Editor
          ref="editor"
          mode="javascript"
          defaultValue={exercise.code || this.props.content}
          onChange={this._onChange.bind(this)}
        />
        <div className="toolbar" style={{marginTop: 5}}>
          <button
            style={{margin: 5, marginLeft: 0}}
            className="button primary"
            onClick={this.runCode.bind(this)}>
            Run
          </button>
          <button
            style={{margin: 5}}
            className="button secondary"
            onClick={this.reset.bind(this)}>
            Reset
          </button>
          {assertion ?
            <button
              style={{margin: 5}}
              className="button success"
              onClick={this.submitCode.bind(this)}>
              Submit
            </button> :
            null
          }
        </div>
        {message ? <div style={{marginTop: 20}}>{message}</div> : null}
      </div>
    );
  }

}
