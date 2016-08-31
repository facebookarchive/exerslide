/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

let cache = [];

/**
 * This is a helper module for layouts to persist slide specific data across
 * slide transitions. For example, the editor input of the visitor.
 */

export function getSlideCacheData(slideIndex, key, defaultData) {
  let result;
  if (cache.hasOwnProperty(slideIndex) &&
      cache[slideIndex].hasOwnProperty(key)) {
    result = cache[slideIndex][key];
  }
  if (result == null) {
    setSlideCacheData(slideIndex, key, defaultData);
    result = defaultData;
  }
  return result;
}

export function setSlideCacheData(slideIndex, key, data) {
  let slideCache = cache[slideIndex];
  if (!slideCache) {
    slideCache = cache[slideIndex] = {};
  }
  slideCache[key] = data;
}

export function getAllCacheData(key) {
  return cache.map(cache => cache[key]).filter(data => data);
}
