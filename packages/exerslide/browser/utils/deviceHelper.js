/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const MAX_MOBILE_WIDTH = 768;
const DEVICE_WIDTH = global.document.documentElement.clientWidth;

export const IS_MOBILE = DEVICE_WIDTH <= MAX_MOBILE_WIDTH;
