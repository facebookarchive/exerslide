/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const path = require('path');
const toSlideObject = require('./toSlideObject');
const transformHelper = require('./slide_transforms/utils/transformHelper');

/**
 * The custom webpack loader. It passes each slide file through a series of
 * transforms. Because of the complexity of the transformations, we couldn't
 * just create multiple individual webpack loaders and chain them.
 *
 * Instead of performing any big changes to the slide source directly, the
 * transformers have access to helper methods to inject placeholders and return
 * a set of actions that should be applied after all transformers have been
 * executed.
 */
module.exports = function(content) {
  this.cacheable && this.cacheable();

  const webpack = this;
  const transforms = this.options.slideLoader ?
    this.options.slideLoader.transforms || [] :
    [];
  const callback = this.async();

  function finalize(slide, actions) {
    if (webpack.debug) {
      slide.__source__ = content;
      slide.__path__ = path.relative('', webpack.resourcePath);
    }

    actions
      .filter(action => action.type !== 'replace' && action.type !== 'prefix')
      .forEach(action => {
        // Reduce higher level actions to lower level actions
        switch (action.type) {
          case 'assign': {
            const id = transformHelper.getID();
            assign(slide, action.propertyPath, id);
            actions.push(
              transformHelper.getReplaceAction(`"${id}"`, action.value)
            );
            break;
          }
          case 'interpolate':
            actions.push(
              transformHelper.getReplaceAction(
                action.search,
                `" + ${action.value} + "`
              )
            );
            break;
          case 'import': {
            const request = JSON.stringify(action.request);
            actions.push(transformHelper.getPrefixAction(
              action.id ?
              [
                `var ${action.id} = require(${request});`,
                `${action.id} = ${action.id} ?`,
                `  ${action.id}.default || ${action.id} :`,
                `  ${action.id};`,
              ].join('\n') :
              `require(${JSON.stringify(action.request)})`
            ));
            break;
          }
        }
      });

    let prefix = [];
    let source = `module.exports = ${JSON.stringify(slide, null, 2)};`

    // All actions reduce to either prefixing code to the final JavaScript file
    // or to replace placeholders with JavaScript code.
    actions
      .filter(action => action.type === 'prefix' || action.type === 'replace')
      .forEach(action => {
        switch (action.type) {
          case 'replace':
            source = source.replace(action.search, action.replace);
            break;
          case 'prefix':
            prefix.push(action.value);
            break;
        }
      });
    if (prefix.length > 0) {
      source = prefix.join('\n') + '\n' + source;
    }
    callback(null, source);
  }

  runTransforms(
    webpack,
    // If a transform is a function instead of an object, we call it and pass
    // transformerHelper to it. This makes it easier for external transforms
    // to get a reference to the helper.
    transforms.map(t => typeof t === 'function' ? t(transformHelper) : t),
    content,
    finalize
  );
};

function runTransforms(webpack, transforms, content, done) {
  const actions = [];
  let afterTransforms = false;

  const api = Object.assign({
    context: webpack.options.context,
    resourcePath: webpack.resourcePath,
  });

  function next(index, data) {
    if (transforms.length === index) {
      if (!afterTransforms) {
        afterTransforms = true;
        const slide = toSlideObject(data, api);
        if (slide.options && slide.options.layout === '__ExerslideError__') {
          webpack.emitWarning(
            (slide.options.title.indexOf('YAML') > -1 ?
             'YAML parse error: ' :
             ''
            ) +
            slide.options.layout_data.error.message
          );
        }
        process.nextTick(() => next(0, slide));
      } else {
        done(data, actions);
      }
    } else {
      const callback = (errors, data, newActions) => {
        if (errors) {
          if (!Array.isArray(errors)) {
            errors = [errors];
          }
          if (errors.length) {
            webpack.emitWarning(
              // Bundle all errors into a single one
              errors
                .map(error => error.message || error)
                .join('\n')
            );
          }
        }
        if (newActions) {
          actions.push.apply(actions, newActions);
        }
        process.nextTick(() => next(index + 1, data));
      };
      const transform = transforms[index][afterTransforms ? 'after' : 'before'];
      if (transform) {
        transform(data, callback, api);
      } else {
        callback(null, data);
      }
    }
  }
  next(0, content);
}
/**
 * Assign a value to a property specified as string path.
 */
function assign(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const lastProp = parts.pop();
  while (parts.length > 0) {
    if (!obj[parts[0]]) {
      obj[parts[0]] = {};
    }
    obj = obj[parts.shift()];
  }
  obj[lastProp] = value;
}
