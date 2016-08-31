/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

import ReactDOM from 'react-dom';
import scriptStore, {registerScript} from 'exerslide/browser-plugins/scriptStore';

let id = 0;

export default function reactRenderer(exerslide) {
  exerslide.use(scriptStore);
}

export function renderIntoDOM(slideIndex, component) {
  const localID = `r${Date.now()}-${id++}`;
  const placeholder = `<div id="${localID}"></div>`;
  registerScript(
    slideIndex,
    () => setTimeout(
      () => ReactDOM.render(component, global.document.getElementById(localID)),
      0
    ),
    () => {
      ReactDOM.unmountComponentAtNode(global.document.getElementById(localID));
    }
  );
  return placeholder;
}
