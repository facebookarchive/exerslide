/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import present from './browser/present';
import {IS_MOBILE} from './browser/utils/deviceHelper';
import {getSlideCacheData, setSlideCacheData} from './browser/slideDataCache';
import {groupByChapter} from './browser/utils/chapterHelper';
import {forward, back} from './browser/navigation';
import {normalizeImageData} from './browser/utils/imageDataHelper';
import {register} from './browser/pluginManager';
import {registerExtension} from './browser/extensionManager';
import {subscribe, subscribeAll} from './browser/pubSub';

/**
 * This is the API exposed to plugins and other client side code. Client side
 * code should only require this file or components in `exerslide/components/`
 * but never directly reach into `exerslide/browser/`.
 */

export {
  IS_MOBILE,
  back,
  forward,
  getSlideCacheData,
  groupByChapter,
  normalizeImageData,
  present,
  register as use,
  registerExtension,
  setSlideCacheData,
  subscribe,
  subscribeAll,
};
