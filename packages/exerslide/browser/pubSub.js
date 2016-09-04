/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {EventEmitter} from 'events';

const emitter = new EventEmitter();

// The default limit is 10. There is no reason to restrict the number of
// listeners
emitter.setMaxListeners(Infinity);

export const publish = emitter.emit.bind(emitter);

export function subscribe(...args) {
  emitter.on(...args);
  return unsubscribe.bind(null, ...args);
}

export function subscribeAll(obj) {
  for (const eventName in obj) {
    if (obj.hasOwnProperty(eventName)) {
      emitter.on(eventName, obj[eventName]);
    }
  }
  return function() {
    for (const eventName in obj) {
      if (obj.hasOwnProperty(eventName)) {
        unsubscribe(eventName, obj[eventName]);
      }
    }
  };
}

export const unsubscribe = emitter.removeListener.bind(emitter);
