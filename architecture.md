# Architecture

This document describes how exerslide is structured. If you want to write a 
plugin for exerslide, this document is for you.

Exerslide has three subsystems:

- [the command line interface](#the-command-line-interface--cli-)
- [the builder](#the-builder)
- [the runtime](#the-runtime)

The last two can also be extended via [plugins](#plugins).

## The Command Line Interface (CLI)

The CLI consists of two parts: The global executable `exerslide` (provided via 
`exerslide-cli`) and subcommands local to each presentation (provided by the 
local `exerslide` package).

The global executable only has a single command built-in: `init`. Its only task
is to create an empty package and install `exerslide` into the current working 
directory.

All other commands used to interact with exerslide (such as `exerslide build`, 
`exerslide serve`) are actually provided by the local `exerslide` installation 
(defined in [`cli/`](packages/exerslide/slide/)).

That makes `exerslide-cli` independent from the current `exerslide` version and
allows to use the global `exerslide` command with any number of presentations, 
even if they have different `exerslide` versions. For example, this allows us 
to add a new command to `exerslide`, without having to update `exerslide-cli`.

## The Builder

The builder is responsible for converting all JavaScript, CSS and other asset 
files into a webpage. It is based on [webpack][] and uses a custom 
[loader][webpack-loader] to convert slide files to JavaScript.

The builder is configured through two files: [`exerslide.config.js`][] and 
[`webpack.config.js`][]. Both of these files are copied into the project folder 
so that they can be customized. `exerslide.config.js` is specific to exerslide, 
`webpack.config.js` is a standard webpack configuration file.

The majority of the work, determining which files to bundle and include in the 
webpage, is done by webpack. Exerslide's loader (slide loader) takes care of 
making the slide files available to webpack.

### The Slide Loader

The slide loader is a transformation pipeline that converts a text file into a 
JavaScript file. Without any additional transformation steps, it would simply
take a text (slide) file, parse the YAML front matter into a JavaScript object, 
adds the "body" of the slide as another property and create a JavaScript file 
that exports that object.

For example, the following file 

```yaml
---
title: Example
---
Hello World!
```

will be converted to

```js
module.exports = {
  options: {
    title: "Example",
  },
  content: "Hello World!"
};
```

#### Getting Slide Files

Before we go into more detail how the transform pipeline works, lets first 
clarify how the loader gets all the slide files. The builder generates a 
temporary file that has all slide files as dependencies.  What is and isn't a 
slide file is determined by two configuration options in `exerslide.config.js`: 
`slidePaths` and `processSlides`.
Their default values are

```js
/**
 * ...
 */
slidePaths: [
  './slides/*',
  './slides/*/*',
],

/**
 * ...
 */
processSlides(paths) {
  return paths.filter(isTextPath).sort();
},
```

This will result in all textfiles in `slides/` or its subfolders to be 
considered a slide file.

With this, the builder generates a temporary file that looks something like

```
module.exports = [
  require('!!slide-loader!/path/to/slide1'),
  require('!!slide-loader!/path/to/slide2'),
];
```

The `!!slide-loader!` part before the path tells webpack to convert this file
via the slide loader.

**Note:** The `slidePaths` patterns are also used to automatically pick up new 
slides when using `exerslide watch` or `exerslide serve`.

#### The Transformation Pipeline

The transformation pipeline is executed in two phases:  The first phase allows 
registered functions to inspect and transform the raw source of the file. The 
second phase lets transformers access and modify the parsed object.

Transformers have access to helper methods that helps them to inject JavaScript 
source code into the slide file. For example, a transformer might want to 
import a module at *runtime* and assign it to a property of the slide object.

The transformer cannot do

```js
slide.converter = require('converter');
```

because that would require the module *now* at build time, and probably 
couldn't be converted to JavaScript source code anyway.  However,

```js
slide.converter = "require('converter')";
```

is not correct either since that would literally result in a JavaScript string 
literal in the source.

Instead, the transform can use a helper method:

```js
const action = utils.getAssignAction(
  'converter',
  'require("converter")'
);
```

that returns an action that can be returned by the transformer.

The general structure of a transformer is a function that returns an object 
with a `before` and / or an `after` property:

```js
function transformer(utils) {
  return {
    before(source, next, options) {
      // analyze and process raw source
      next(error, source, actions);
    },
    after(slide, next, options) {
      // modify slide object
      next(error, slide, actions);
    },
  };
}
```

`next` passes control to the next transformer and accepts an error object (or 
`null`), the modified `source` or `slide` object, and a list of `actions` to
perform to generate the final JavaScript file.

An example of a transformer is the [language highlight 
transformer](packages/exerslide-plugin-markdown-converter/extractLanguageHighlights.js).  
It looks for all code fences with a language name and injects code into the 
final JavaScript file to load only the highlighter for the used languages.


[`exerslide.config.js`]: packages/exerslide/scaffolding/exerslide.config.js
[`webpack.config.js`]: packages/exerslide/scaffolding/webpack.config.js


## The Runtime

Exerslide creates a [React][] web application. The code is split between files 
in the project directory and exerslide's internals 
([`browser/`](packages/exerslide/browser), 
[`components/`](packages/exerslide/components/)). Upon initialization of a new 
project, exerslide copies a couple of React components and CSS files into the 
project folder so that the author can customize them more easily.

`js/presentation.js` inside a project folder is the main entry file and calls 
exerslide's `present` function.  This function accepts a list of slide objects 
and a master layout, and sets up a pubsub system to communicate events 
throughout the app and plugins.

> TODO: expand

## Plugins

There are two types of plugins that can be written for exerslide: *build-time* 
(server) plugins and *run-time* (browser) plugins.

### Build-time plugins

Build-time plugins are plugins that provide information or functionality at 
build time (note: these plugins can also provide runtime functionality).
They can

- add transformers to the transformation pipeline
- extend the webpack configuration
- provide layouts
- provide content converters

Built-time plugins are registered in the `exerslide.config.js` file. 

```
plugins: [
  'center-layout',
  'column-layout',
  'html-converter',
  'markdown-converter',
],
```

These plugins have to be node packages themselves and follow specific rules:

- If a plugin has a `init.js` file and it exports a function, the function is 
  called when the build process starts and gets passed
the `exerslide.config.js` and `webpack.config.js` configuration objects. This 
allows plugins to influence the build process (e.g. add a transformer).

- If a plugin has a `layouts/` folder, components in that folder are made 
available to slides as layouts at runtime.

- If a plugin has a `contentTypes/` folder, the files in that folder are made 
available as content type converters at runtime.

### Run-time plugins

Run-time plugins extend how exerslide works in the browser. They can

- extend the UI
- configure or extend convent type converters
- react to user events and exerslide events

Run-time plugins are added in the `js/exerslide.js` file of the project.  
exerslide's browser API (`exerslide/browser`) provides the function `use` to 
register plugins:

```js
import somePlugin from 'somePlugin';
use(somePlugin, optionalArguments);
```

A run-time plugin is just a function that gets passes the exerslide browser API 
object, so you could just as well do

```js
somePlugin(exerslide, optionalArguments);
```

The exerslide browser API has methods that allow plugins to listen to internal 
exerslide events, such as when a slide is shown or the initial page load is 
complete. Many core features, such as keyboard navigation or content scaling, 
are implemented as plugins.

#### Example: Reacting to exerslide events

The following example logs the title of the current slide to the console.

```js
function logTitlePlugin(exerslide) {
  exerslide.subscribe('SLIDE.DID_MOUNT', function(data) {
    console.log(data.slide.options.title);
  });
}
```

#### Example: Extend the UI

Exerslide allows the author to "mark" certain places in the UI (e.g. in the 
master layout) as "extension points". This is done by using the 
`ExtensionPoint` component. For example:

```js
<ExtensionPoint tags={['main']}>
  <div id="main">
    {children}
  </div>
</ExtensionPoint>
```

Extension points are already present in the default master and slide layouts 
and in other components such as the toolbar.

A plugin can call `exerslide.registerComponent` to dynamically "inject" a 
component into the component tree. `registerComponent` accepts a component, a 
"mode" (how to inject the component) and a list of tags that indicate at which 
extension point to inject the component.

Via `mode` the plugin can specify if the component should be prepended or 
appended to extension point, if it should wrap the extension point or even 
replace its content.

In the below example the extension point preprends a text field that shows the 
layout name of the current slide.

```js
function showChapterName(exerslide) {
  exerslide.registerComponent(
    ({slide}) => <div>Layout: {slide.options.layout || '(no layout)'}</div>,
    'before',
    ['main']
  );
}
```

Have a look at [`browser/plugins/`](packages/exerslide/browser/plugins/) for 
examples.

[webpack]: https://webpack.github.io/
[webpack-loader]: https://webpack.github.io/docs/using-loaders.html
[react]: https://facebook.github.io/react/
