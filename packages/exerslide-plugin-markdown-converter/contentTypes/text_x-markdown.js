/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react'; // eslint-disable-line no-unused-vars
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/highlight';
import markdownItFillSlideTitle from '../utils/markdownItFillSlideTitle';
import markdownItBlankLinks from '../utils/markdownItBlankLinks';

/**
 * Converts markdown slides to HTML. The markdown renderer is customized in the
 * following ways:
 *
 *   - highlight.js is used for highlighting code blocks. The which languages
 *     definitions to load is determined during build time.
 *
 *   - A list of links can be shared across all slides via the references
 *    config option. The value is a `name -> URL` object
 *    and is (by default) generated from references.yml via webpack.
 *    This lets you avoid duplicating links.
 *
 *   - Interslide linking: If you link to a slide without any link text
 *     (e.g. `[](#/3)`), the title or toc of the slide is automatically used as
 *     link text.
 *
 * You can extend the markdown parser by setting the "markdown-parser" option
 * on the config object in js/persentation.js. The value is supped to be a
 * function that gets passed the current markdown-it instance.
 *
 * Example:
 *
 * present({
 *   // ...
 *   'markdown-parser': md => {
 *     md.use(myPlugin);
 *   },
 * });
 */

const md = MarkdownIt({
  html: true,
  tables: true,
  typographer: true,
  highlight:
    (code, lang) => {
      if (lang) {
        return hljs.highlightAuto(code, [lang]).value;
      }
      return hljs.highlightAuto(code).value;
    },
})
  .use(markdownItFillSlideTitle)
  .use(markdownItBlankLinks);

// We are going to cache every conversion.
const cache = new Map();

function getReferences(config) {
  let referencesFromConfig = config.references;
  const normalizedReferences = {};
  for (const name in referencesFromConfig) {
    let value = referencesFromConfig[name];
    if (typeof value !== 'object') {
      value = {href: value};
    }
    normalizedReferences[md.utils.normalizeReference(name)] = value;
  }
  return normalizedReferences;
}

let convertInternal = (text, context) => {
  // The first time this function is called we are performing some intialization
  // tasks for the markdown parser. These are:
  // - Applying any user defined configs to the markdown parser
  // - Preparing shared references
  const references = getReferences(context.config);
  const applyAdditionalMarkdownConfig = context.config['markdown-converter'];
  if (applyAdditionalMarkdownConfig) {
    applyAdditionalMarkdownConfig(md);
  }

  // We are replacing this function so that the initialization steps only happen
  // the first time.
  convertInternal = (text, context) => md.render(
    text,
    {references, ...context}
  );
  return convertInternal(text, context);
};

export default function convert(markdown, context) {
  let result = cache.get(markdown);
  if (!result) {
    result = convertInternal(markdown, context);
    cache.set(markdown, result);
  }
  return <div dangerouslySetInnerHTML={{__html: result}} />;
}
