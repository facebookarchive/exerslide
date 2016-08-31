---
id: exerslide.config.js
title: exerslide.config.js
---

This file contains configuration options specific to exerslide, such as which 
CSS files to load. It is a JavaScript file which exports a configuration 
object.

<div class="callout primary">

**Note:** Unlike slide headers, these options use [camel case][] as naming 
convention. This is more common in JavaScript and is also consistent with how 
options are named in `webpack.config.js`. This shouldn't be a big issue since 
all the possible options pre-exist in the default config file.

</div>

## Configuration options

### `stylesheets`

```javascript
stylesheets: [
  'bootstrap/dist/css/bootstrap.css',
  'font-awesome/css/font-awesome.css',
  'highlight.js/styles/solarized-light.css',
  './css/style.css',
],
```

An array of file or module paths to stylesheets. These files are bundled in the 
order they are listed. The easiest way to overwrite default styles or define 
your own is to create a new CSS file and add it at the end of this array.

### `defaultLayouts`

```javascript
defaultLayouts: {
  '.center.md': 'Center',
},
```

An object that maps file extensions to layout names. If you have many slides 
that use a specific layout, you can give each slide file the same file 
extension and use this option, instead of specifying the layout in the front 
matter of each slide.

### `assets`

```javascript
assets: [
  './statics/**/*',
],
```

An array of file patterns. Files matching these patterns are copied directly 
into the output folder.

### `plugins`

```
plugins: [
  'center-layout',
  'twocolumn-layout',
  'html-converter',
  'markdown-converter',
  'shared-urls',
],
```

An array of plugin names (or paths). These plugins are used to provide 
additional [layouts](#/layouts), [content type converters](#/contenttypes), or 
other functionally to webpack or exerslide. The convention is to prefix the 
name of exerslide specific plugins with `exerslide-plugin-`, but this prefix 
can be omitted in this list (i.e. `'center-layout'` will look for a module 
named `center-layout` and `exerslide-plugin-center-layout`).

### `out`

```javascript
out: path.join(__dirname, './out'),
```

Absolute path to the output directory. It is directly passed to webpack.

### `slidePaths`

```javascript
slidePaths: [
  './slides/*',
  './slides/*/*',
],
```

A list of file patterns. These patterns are primarily used to detect the 
addition of new slides and changes to existing slides. By default it matches 
any file inside `./slides` and its immediate subfolders.

### `processSlides`

```javascript
processSlides(paths) {
  return paths.filter(isTextPath).sort();
},
```

A function that is passed the list of file paths matched by the patterns in 
`slidePaths`. This function allows you to further filter the matched paths or 
reorder them.
