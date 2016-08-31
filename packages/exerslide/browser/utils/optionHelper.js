/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const mergeStrategies = {
  class_names(...options) {
    return options.reduce((target, classes) => {
      target.push(...classes);
      return target;
    }, []);
  },
};

const renameConfig = {
  class_names: 'classNames',
  hide_toc: 'hideTOC',
  layout_data: 'layoutData',
  content_type: 'contentType',
  scale: value => ([
    'scale',
    renameProperties(
      value,
      {
        content_width: 'contentWidth',
        column_width: 'columnWidth',
        max_font_size: 'maxFontSize',
      }
    ),
  ]),
};

function renameProperties(object, config) {
  for (const prop in object) {
    if (!config.hasOwnProperty(prop)) {
      continue;
    }
    let value = object[prop];
    let name;
    switch (typeof config[prop]) {
      case 'function':
        ([name, value] = config[prop](value));
        delete object[prop];
        object[name] = value;
        break;
      case 'string':
        delete object[prop];
        object[config[prop]] = value;
        break;
    }
  }

  return object;
}

/**
 * Takes multiple options and merges and renames them based on the above
 * settings.
 *
 * @param {...Object} options Options to normalize.
 */
export function normalizeOptions(...options) {
  const target = {};
  options.forEach(option => {
    for (const prop in option) {
      if (!(prop in target)) {
        target[prop] = option[prop];
      } else if (mergeStrategies[prop]) {
        target[prop] = mergeStrategies[prop](target[prop], option[prop]);
      } else {
        target[prop] = option[prop];
      }
    }
  });
  return renameProperties(target, renameConfig);
}
