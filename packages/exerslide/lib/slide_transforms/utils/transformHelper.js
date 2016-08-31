/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const path = require('path');

/**
 * Returns a unique identifier name.
 */
exports.getID = (function() {
  let counter = 0;
  return function id() {
    return `__SLIDE_LOADER${Date.now()}${counter++}__`;
  };
}());

/**
 * Returns an action to prepend the value to the source.
 *
 * @param {string} value JavaScript source text.
 * @return {Object}
 */
exports.getPrefixAction = function getPrefixAction(value) {
  return {
    type: 'prefix',
    value,
  };
}

/**
 * Returns an action for generic source replacement, i.e. it's literally a
 * search and replace. Make sure the value you are searching for is unique.
 *
 * @param {string} search The value to replace
 * @param {string} replace The replacement
 * @return {Object}
 */
exports.getReplaceAction = function getReplaceAction(search, replace) {
  return {
    type: 'replace',
    search,
    replace,
  };
}

/**
 * Text interpolation. The value to search for is assumed to be contained inside
 * a string literal in the final source, e.g.
 *
 * "foo <search> bar"
 *
 * The search value is going to be removed and replaced by a concatenation with
 * the value:
 *
 * "foo " + value + " bar"
 *
 * @param {string} search The value to replace
 * @param {string} replace The replacement
 * @return {Object}
 */
exports.getInterpolateAction = function getInterpolateAction(search, value) {
  return {
    type: 'interpolate',
    search,
    value,
  };
};

/**
 * Treats `value` as JavaScript code and will "assign" that value to the
 * specified property of the slide object.
 *
 * E.g. given "foo.bar" and "1 + 1", the final result will be
 *
 * module.exports = {
 *   "foo": {
 *     "bar": 1 + 1
 *   }
 * }
 *
 * This is useful to assign variables to properties instead of string values.
 *
 * @param {string} propertyPath The property of the slide object to assign to
 * @param {string} value The value to assign (JavaScript code)
 * @return {Object}
 */
exports.getAssignAction = function getAssignAction(propertyPath, value) {
  return {
    type: 'assign',
    propertyPath,
    value: value,
  };
};

/**
 * This will import/require the requested path and optionally assign it to "id".
 *
 * You probably want to use this together with `getAssignAction` to assign the
 * id to a property.
 *
 * @param {?string} id If set, the imported module is assigned to this ID
 * @param {string} request Path to the module
 * @param {?string} context Make the request path relative to this context
 * @return {Object}
 */
exports.getImportAction = function getImportAction(id, request, context) {
  if (context) {
    request = path.relative(context, request);
  }

  return {
    type: 'import',
    id,
    request,
  };
};
