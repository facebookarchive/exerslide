This project was created with [exerslide][]. This document contains information
about how to perform common tasks.

## Table of Contents


### Project Maintenance
- [Updating to New Release](#updating-to-new-release)
- [Directory Structure](#directory-structure)

### Content Creation and Organization
- [Organize Slides](#organize-slides)
- [Creating a Slide](#creating-a-slide)
- [Using Images in Slides](#using-images-in-slides)
- [Linking Between Slides](#linking-between-slides)
- [Updating CSS styles](#updating-css-styles)

### Customization
- [Using Custom Components](#adding-custom-components)
- [Adding a Stylesheet](#adding-a-stylesheet)
- [Adding Dependencies](#adding-dependencies)
- [Creating a Layout](#creating-a-layout)
- [Creating a Content Converter](#creating-a-content-convert)
- [Using Plugins](#using-plugins)

## Updating to New Releases

If you have a "living" presentation, you might want to update to a new versions
of exerslide. exerslide is split into two packages:

- `exerslide-cli` is the global command-line utility with which you can create
new projects
- `exerslide` is a dependency of every project and contains the core logic of
the presentation

You rarely will have to update `exerslide-cli`, it delegates everything to the
local `exerslide` in the current project.

To get the new *patch* version of `exerslide`, run

```sh
npm update exerslide
```

in the project.

To get the latest version, run

```sh
npm install --save exerslide@latest
```

In both cases, run

```sh
exerslide copy-defaults
```

to get the latest changes to the default files in your project. If there are
conflicts, you will be given the option to resolve them.

**Note:** If you upgrade to a new feature version (e.g. `1.x.z` to `1.y.z`),
you might have to update your custom CSS and JavaScript files.

If `package.json` changed, you might also have to run `npm install` to get the
latest dependencies.

## Directory structure

After creation, your project should look like

```
myProject/
  css/
    exerslide.css
    myProject.css
  js/
    components/
    MasterLayout.js
    SlideLayout.js
    presentation.js
  node_modules/
  out/
  slides/
  exerslide.config.js
  index.html
  package.json
  webpack.config.js
```

- `css/exerslide.css` contains the default CSS styles.
- `css/myProject.css` you can add your own styles here.
- `js/presentation.js` is the main entry file. You can edit it to load
  additional plugins and configure other aspects of your presentation.
- `js/MasterLayout.js` defines the overall structure of the site.
- `js/SlideLayout.js` defines the structure shared by every slide.
- `js/components/` contains React components that are used by the default
  master layout.
- `node_modules/` contains all of the projects dependencies.
- `out/` is the default folder where the generated presentation is stored.
- `slides/` is the folder where you put your slides
- `exerslide.config.js` Exerslide-specific configuration options
- `webpack.config.js` Webpack configuration file


## Organize Slides

By default, exerslide determines the order of the slides by sorting the file
names alphabetically. For example, if you name your slides as

```text
slides/
  00-Intro.md
  01-MainTopic.md
  02-End.md
```

exerslide will pick up the slides in that order.

**Note:** Aside from the order, you can name the files however you want.

Slides can be grouped as **chapters** by putting all slides of a chapter into a
folder. For example:

```text
slides/
  00-Intro.md
  01-chapter1/
    00-Problem.md
    01-Solution.md
  02-Summary.md
```

Like with file names, exerslide doesn't care about the actual name of the
folder.


## Creating a Slide

Slide are text files and stored in `slides/`. Metadata is stored in the YAML
front matter and content is stored in the body. Use the correct file extension
for the markup you are using in the slide.

### `slides/example.md`

```yaml
---
title: Title of the slide
---
This is the **content**
```

### `slides/another_example.html`

```
---
title: An HTML example
---
<p>
  HTML <strong>content</strong>.
</p>
```

[Learn more about which metadata options are available][metadata].

## Using Images in Slides

Thanks to webpack, including an image in a slide is as simple as referencing
it. If your slide structure is as follows

```
slides/
  images/
    example.png
  intro.md
```

then you can refer to the image as usual via a relative path:

**slides/intro.md**
```yaml
---
title: Introduction
---

Look at this image:

![Example image](./images/example.png)
```

Of course that works for HTML or any other markup as well.


## Linking Between Slides

Give the slide you want to link to an `id`, and use `#/id` as the URL in the
link.

For example:

**slides/firstSlide.md**
```yaml
---
title: First Slide
id: first
---
Content of the first slide.
```

**slides/secondSlide.md**
```yaml
---
title: Second Slide
---
Content of the second slide.

Go back to the [first slide](#/first)
```

If you are using *Markdown* you can even omit the link text and have exerslide
automatically using the corresponding slide title. In the above example, using
`[](#/first)` would be the same as `[First Slide](#/first)`.


## Using Custom Styles

While you can edit the default CSS rules (`css/exerslide.css`), it's better if
you add styles to your own stylesheet. When creating a new project, exerslide
will create an empty CSS file where you can put your CSS rules.

**css/myProject.css**
```css
.exerslide-slide > pre > code {
  background-color: #FFF;
}
```


## Using Custom Components

You can create and use your own React components. Exerslide supports ES6
modules and syntax thanks to Babel.

The following example adds a footer to the bottom of the page:

**js/Footer.js**

```js
import React from 'react';

export default function Footer() {
  return <div>Example footer</div>;
}
```

**js/MasterLayout.js**

```js
import Footer from './Footer.js';

export default function MasterLayout({className, children}) {
  return (
    <div id="exerslide-page" className={className}>
      <TOC togglable={true} />
      <ExtensionPoint tags={['main']}>
        <div id="exerslide-main" className="flex-column">
          {children}
          <Toolbar className="flex-item-fix" />
          <Footer />
        </div>
      </ExtensionPoint>
    </div>
  );
}
```

## Adding a Stylesheet

Create a new file in `css/`:

```css
/* css/additionalStyles.css */
.exerslide-page {
  background-color: blue;
}
```

and add it to `styles` in `exerslide.config.js`:

```js
/**
 * Paths to stylesheets. Can refer to modules.
 */
stylesheets: [
  'foundation-sites/dist/css/foundation.css',
  'font-awesome/css/font-awesome.css',
  'highlight.js/styles/solarized-light.css',
  './css/style.css',
  './css/myProject.css',
  './css/additionalStyles.css',
],
```

If you are using CSS styles to style a specific component, you can also just
import the CSS stylesheet from the component itself (instead of editing
`exerslide.config.js`, thanks to webpack):

```js
import React from 'react';
import './css/header.css';

export default function Header(props) {
  return (...);
}
```

## Adding Dependencies

A new project already has a couple of essential dependencies, but you can
easily add more to use in your own JavaScript files.

```bash
npm install --save <library-name>
```

## Creating a Layout

Layouts contain *behavior* and allow you do keep your slides simple. Layouts
are React components and stored in the `layouts/` directory of the project.

The layout components get passed the title, the layout data and the content of
the slide. Any content should be rendered via exerslide's `<ContentRenderer />`
(which takes care of converting markup to react elements).

The following example demonstrates a simple two column layout (but have a look
at `exerslide-plugin-column-layout` for a more elaborate version).

**`layouts/TwoColumns.js`**
```js
import React from 'react';
import ContentRenderer from 'exerslide/components/ContentRenderer';

export default function TwoColumns({title, content}) {
  const [left, right] = content.split(/^+++$/);
  return (
    <div>
      <div>{title}</div>
      <div>
        <div><ContentRenderer value={left} /></div>
        <div><ContentRenderer value={right} /></div>
      </div>
    </div>
  );
}
```

To use this layout for a specific slide, use `layout: TwoColumns` in the
metadata header:

```yaml
---
title: A slide with two columns
layout: TwoColumns
---
Left column
+++
Right column
```

## Creating a Content Converter

If you are using a markup language other than Markdown or HTML, you can create
your own content converter. Content converters are stored in in the
`contentTypes/` directory of the project. Content converters are functions that
receive a value and context information (the current slide object, the slide
index, the configuration object, etc) and return something that React can
render.

The following example creates a hypothetical wikitext:

**`contentTypes/wikitext.js`**
```js
import React from 'react';
import wikitext from 'hypothetical-wikitext-parser';

export default function convert(value, context) {
  return <div dangerouslySetInnerHTML={{__html: wikitext(value)}} />;
}
```

This converter can be used in slides by specifying the `content_type` in the
metadata header:

```yaml
---
title: Example
content_type: wikitext
---
'''Wikitext''' example
```

## Using Plugins

Plugins provide layouts, content type converters or other functionality that
make it easier for your to *write* slides.

For example, the layouts that exerslide ships with (`Column`, `Center`, etc.)
are implemented as plugins.

To be able to use these plugins, add them to the `plugins` array in
`exerslide.config.js`:

```js
/**
 * List of plugins to load. Plugins provide layouts, content type converters,
 * or other extensions to the exerslide or webpack config.
 *
 * A list of module names (exerslide-plugin-* can be omitted) or paths.
 */
plugins: [
  'bulletlist-layout',
  'center-layout',
  'column-layout',
  'html-converter',
  'markdown-converter',
],
```

There is another type of plugins that extend an exerslide presentation at
runtime, i.e. when viewing the presentation. Some of exerslides core features
are implemented as such extensions. They are added in `js/presentation.js`, for
example:

```js
import debugInformation from 'exerslide/browser-plugins/debugInformation';
use(debugInformation);
```

[exerslide]: https://github.com/facebookincubator/exerslide
[metadata]: https://facebookincubator.github.io/exerslide/#/metadata

<!-- This hash helps exerslide to find out whether this file needs to be
updated. Please keep it even if you completely change this README.
@exerslide-file-hash
-->
