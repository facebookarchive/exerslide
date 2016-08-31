/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export default function a11yExamples(exerslide) {
  exerslide.subscribe('CONFIG.SET', config => {
    config['markdown-converter'] = md => {
      md.use(require('markdown-it-container'), 'a11y', {
        render: function(tokens, index) {
          const token = tokens[index];
          if (token.nesting === 1) {
            return '<div class="accessible-example">' +
              '<label class="meta-data-code-toggle">' +
              '<input type="checkbox" /> Show accessible version of this example' +
              '</label>';
          }
          return '</div>';
        },
      });
    };
  });

  exerslide.subscribe('SLIDE.DID_MOUNT', setup);
  exerslide.subscribe('SLIDE.WILL_UNMOUNT', teardown);
}

function setup({slide}) {
  if (/^::: a11y/m.test(slide.content)) {
    setTimeout(() => {
      forEachInput(function(input) {
        console.dir(input);
        input.addEventListener('change', toggleCodeExample);
      });
    }, 0);
  }
}

function teardown({slide}) {
  if (/^::: a11y/m.test(slide.content)) {
    forEachInput(function(input) {
      input.removeEventListener('change', toggleCodeExample);
    });
  }
};

function toggleCodeExample() {
  var defaultExample = this.parentNode.nextElementSibling;
  var accessibleExample = defaultExample.nextElementSibling;

  var toShow = this.checked ? accessibleExample : defaultExample;
  var toHide = this.checked ? defaultExample : accessibleExample;
  toShow.style.display = 'block';
  toHide.style.display = 'none';
}

function forEachInput(callback) {
  var inputs = global.document.querySelectorAll('.meta-data-code-toggle > input');
  for (var i = 0; i < inputs.length; i++) {
    callback(inputs[i]);
  }
}
