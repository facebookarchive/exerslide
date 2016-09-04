/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const leven = require('leven');

/**
 * This function validates slide options. It verifies that
 *
 * - the slide doesn't specify unknown options (except "private" ones starting
 *   with `_`). An unknown option could simply be a typo, so it also tries to
 *   make suggestions for the correct option.
 * - the type and structure of the option value is correct
 *
 * @param {Object} options The slide options
 * @param {bool} defaults (used internally)
 * @return {Array} The first value of the array indicates whether there is an
 *   error or not. The second element is a list of errors.
 */
exports.validateOptions = function validateOptions(options, defaults) {
  const errors = [];

  for (const prop in options) {
    if (prop.charAt(0) === '_') {
      continue;
    }
    if (prop === 'defaults') {
      const result = validateOptions(options[prop], true);
      if (!result[0]) {
        errors.push.apply(errors, result[1]);
      }
      continue;
    }
    if (!(prop in availableOptions)) {
      let msg = `Unknown option "${prop}".`;
      const closestOption = getClosestOptionFor(prop);
      if (closestOption) {
        msg += ` Did you mean "${closestOption}" instead?`;
      }
      errors.push(new Error(msg));
    } else if (availableOptions[prop].validate) {
      try {
        availableOptions[prop].validate(options[prop]);
      } catch (error) {
        errors.push(error);
      }
    } else if (defaults && !availableOptions[prop].default) {
      errors.push(`"${prop}" is not allowed in "defaults".`);
    }
  }

  return [errors.length === 0, errors];
};

function error(field, msg) {
  throw new Error(`Invalid value for "${field}":\n  ${msg}`);
}

/**
 * Helper function that returns a function that verifies that a field value is
 * of the provided primitive type.
 */
function typeValidator(field, type) {
  return x => {
    if (typeof x !== type) {
      error(
        field,
        `Expected a value of type "${type}" but got value ` +
        `\`${JSON.stringify(x)}\` instead.`
      );
    }
    return true;
  };
}

/**
 * The available options. Each object value can have the following properties:
 *
 * - validate (function): A validator for the value. Throws an error if the
 *   value is not valid.
 * - default (bool): True if the option can be a default option (default options
 *   are specified in the first slide under the "default" key and are applied
 *   to all slides)
 */
const availableOptions = {
  id: {
    validate: value => {
      if (typeof value !== 'string' || value.indexOf('/') !== -1) {
        error('id', 'Value must be a string and not contain "/".');
      }
      return true;
    },
  },
  title: {},
  toc: {},
  style: {
    validate: typeValidator('style', 'string'),
  },
  script: {
    validate: typeValidator('script', 'string'),
  },
  chapter: {},
  layout: {
    validate: typeValidator('layout', 'string'),
  },
  content_type: {
    validate: typeValidator('content_type', 'string'),
  },
  class_names: {
    default: true,
    validate(value) {
      if (!Array.isArray(value)) {
        error(
          'class_names',
          `Value must be an array (got "${JSON.stringify(value)}" instead).`
        );
      }
      return true;
    },
  },
  layout_data: {},
  hide_toc: {
    default: true,
    validate: typeValidator('hide_toc', 'boolean'),
  },
  scale: {
    firstSlideOnly: true,
    validate(value) {
      if (typeof value === 'boolean') {
        return true;
      }
      let msg = [];
      if (value && typeof value === 'object') {
        if ('content_width' in value &&
            Math.floor(value.content_width) !== value.content_width
           ) {
          msg.push(
            '"scale.content_width" must be a number representing ' +
            'content width in "em"s.'
          );
        }
        if ('column_width' in value &&
            (value.column_width <= 0 || value.column_width > 1)
         ) {
          msg.push(
            '"scale.column_width" must be a number between 0 ' +
            '(exclusive) and 1 (inclusive), expressing how much of the ' +
            'screen (width) should show content.'
          );
        }
        if ('max_font_size' in value &&
           (Number(value.max_font_size) !== value.max_font_size ||
            value.max_font_size  < 1)
        ) {
          msg.push('"scale.max_font_size" must be a postive number.');
         }
      } else {
        msg.push(
          'Value must either be "false" or an object with properties ' +
           '"content_width", "column_width" and/or "max_font_size".'
       );
      }
      if (msg.length > 0) {
        error('scale', msg.join('\n'));
      }
      return true;
    },
  },
  defaults: {},
};

/**
 * Compute the closest suggestion for an invalid option name.
 */
const availableOptionNames = Object.keys(availableOptions);
function getClosestOptionFor(name) {
  var candidate = availableOptionNames
    .map(availableName => [availableName, leven(name, availableName)])
    .filter(result => result[1] <= 3)
    .sort((a, b) => a[1] - b[1])[0];

  return candidate ? candidate[0] : null;
}
