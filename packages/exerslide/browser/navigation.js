/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {publish} from './pubSub';

export const FORWARD = 'NAVIGATION.forward';
export const BACK = 'NAVIGATION.back';
export const TO_SLIDE = 'NAVIGATION.TO_SLIDE';

export function forward() {
  publish(FORWARD);
}

export function back() {
  publish(BACK);
}

export function gotToSlide(index) {
  publish(TO_SLIDE, index);
}
