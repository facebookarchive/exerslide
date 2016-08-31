---
title: webpack.config.js
---

This is a standard webpack configuration file. See the [webpack configuration 
documentation][config] for more information. There is one thing worth calling 
out though.

## `webpackConfig.slideLoader`

`slideLoader` is an exerslide specific option that is passed to exerslide's own 
loader. It allows you to configure custom transforms that should be applied 
when processing slides. This is also used by plugins to extend exerslide.

<div class="callout warning" role="alert">

  **Note:** You won't be able to run `webpack` directly in the project folder.
  When running `exerslide build`, exerslide augments your configuration with 
  additional options required for building. If `webpack` was run directly, 
  those options would be missing.

</div>

[config]: http://webpack.github.io/docs/configuration.html
