/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Helper function to normalize various ways of defining a reference to an
 * image.
 *
 * An image can either be defined as simply a path to local or local file, or
 * an object with a `src` and (optionally) `alt` property.
 *
 * This function normalizes the values. It will either return an object or null
 * if the input is not a valid image source.
 *
 * @param {string|{src: string}} imageData An image reference
 *
 * @return {{src: string}|null}
 */
export function normalizeImageData(imageData) {
  if (isPath(imageData)) {
    return {src: imageData};
  } else if (isImageObject(imageData)) {
    return imageData;
  }
  return null;
}

const URL_PATTERN = /^https?:/;
const PATH_PATTERN = /(?:\.{0,2}\/)?(?:[^\/]\/)*[^\/.]+\.\w{2,}/;

// Only exported for tests
export function isPath(path) {
  return typeof path === 'string' &&
    (URL_PATTERN.test(path) || PATH_PATTERN.test(path));
}

// Only exported for tests
export function isImageObject(imageData) {
  return Boolean(imageData) && isPath(imageData.src);
}
