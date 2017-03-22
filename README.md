# exerslide 

[![Build Status](https://travis-ci.org/facebookincubator/exerslide.svg?branch=master)](https://travis-ci.org/facebookincubator/exerslide)

A tool to generate simple HTML slideshows/tutorials (from text files). The
primary intent is to generate interactive presentations for teaching web
technologies. Built on [React][] and [webpack][].

- [Examples](#examples)
- [Getting Started](#getting-started)
- [Slides](#slides)
- [Layouts](#layouts)
- [Content types](#content-types)
- [Configuration](#configuration)
- [CLI](#cli)
- [Plugins](#plugins)

## Examples

Presentations / sites built with exerslide:

- [Teach Access](https://teachaccess.github.io/tutorial/)
- [HIKE](http://accessibility.parseapp.com/)
- [JavaScript basics](http://felix-kling.de/jsbasics/)

## Getting started

exerslide comes in two parts: A global command line interface to initialize and 
build presentations, and a module that contains further dependencies to build 
the presentation.

1. First install the `exerslide-cli` package globally:

    ```bash
    npm install -g exerslide-cli
    ```

2. Initialize a new project / presentation, by creating a new folder and
running `exerslide init`:

    ```sh
    mkdir myPresentation
    cd myPresentation
    exerslide init myPresentation
    ```

3. Created/edit slides in `slides/`.

4. Run

    ```sh
    exerslide serve
    ```

  to start a local webserver to view the presentation.

## Concepts

**Note:** Most of the of the build process is handled by [webpack][].  
`exerslide init` (or `exerslide copy-defaults`)  copies 
[`exerslide.config.js`][exerslide-config] and
[`webpack.config.js`][webpack-config] into the project.  Most of the default 
behavior here is defined in these files and can be customized.

### Slides

Slides are defined as text files which contain *content* and *metadata*. The
metadata is defined in an optional [YAML][] front matter block, followed by the
content:

```yaml
---
title: Title of the slide
---
This is the content
```

(basically just like [Jekyll][])

[jekyll]: http://jekyllrb.com/docs/frontmatter/

#### Organizing Slides

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

Like with filenames, exerslide doesn't care about the actual name of the
folder.

#### Metadata

exerslide provides the ability to configure certain aspects of a slide via the
YAML front matter. It currently supports the following, optional, configuration
options:

- `title`: The value of `title` will be rendered as an `<h1>` element above the
  content.
- `toc`: The name to show in the table of contents. If not present, the `title`
  option will be used. If that one is not present either, it will show "Slide X"
  where X is the index of the slide.
- `chapter`: The name of the chapter this slide belongs to. It serves two
  purposes:

    1. It can be used as alternative to group slides by chapter (i.e. you don't
       have to use folders if you don't want to).
    2. This name will be shown for the chapter in the progress bar / table of 
       contents of the presentation. If you organize your slides in folders, you
       only have to define this key in the first slide of the folder. All other
       slides "inherit" the chapter name from the first slide.
- `layout`: The name of the [layout](#layouts) to use (overwrites layout 
inference).
- `content_type`: The markup language used for the content (overwrites [content 
type](#content-types) inference).
- `class_names`: A list of CSS class names to be added to the root of
  page/presentation. This allows for sharing specific styles across slides.
- `style`: CSS style declaration, additional CSS to use on this slide.
- `id`: A name that is unique among the slides. This provides a "safer" way to
link between slides.
- `layout_data`: Additional data to be sent to the layout used for this slide.
- `hide_toc`: The table of contents is hidden for this slide if set to `true`.
- `scale`: Exerslide automatically adjusts the font size for different screen 
widths to ensure that the slides are always readable. `scale` lets you 
customize the behavior to some degree. **Note:** This option can only be set on 
the first slide.
  - `false`: If set to `false`, no adjustments will be made
  - `Object`: Otherwise the value can be object with up to three properties:
    - `content_width`: Specifies the content width in `em`s. This can be 
    thought of as how many words / characters per line should be shown.
    - `column_width`: A number between 0 and 1. How much of the screen (width) 
    should be occupied by the content.
    - `max_font_size`: Don't make the font any larger than this value (in 
    pixel).

### Layouts

Layouts define how the content (and layout data) of a slide are structured.
For example the [Column layout][] renders the content in multiple columns.

Layouts are implemented as [React][] components, which allows you to create
arbitrarily complex layouts. For example the [JavaScriptExercise layout][]
renders a text editor containing the content of the slide and contains
logic to validate the user's solution.

The primary idea behind exerslide is to move all the behavior in reusable
layouts, to keep the actual content creation simple.

#### Layout inference

Which layout to use for a slide is determined by the following process:

1. The slide's `layout` metadata field.
2. If not present, the layout is inferred from the file extension. This mapping
  can be [configured](#configuration).
3. If it can't be inferred, no layout is used.

[Column layout]: packages/exerslide-plugin-twocolumn-layout/
[JavaScriptExercise layout]: packages/exerslide-plugin-javascriptexercise-layout/

#### Layout file resolution

Both, the `layout` field and the file extension mapping expect the *layout name*
as value. exerslide will look for a file with the same name (ignoring the file 
extension) in the `layouts/` folder of the project itself or any loaded 
[plugin](#plugins).

**Example:**

If the slide contains

```yaml
---
layout: Columns
---
```

and the `exerslide-plugin-columns-layout` is loaded (which it is by default), 
then exerslide will look for

- `./layouts/Column.js`
- `exerslide-plugin-columns-layout/layouts/Columns.js`.

**Note:** exerslide will show an error if there are multiple layouts with the 
same name. If you want to specify a layout of a specific plugin, you can use 
the `<pluginName>:<layoutName>` syntax, e.g.

```yaml
---
layout: columns-layout:Columns
---
```

#### Layout data

Layouts have access to the `layout_data` metadata option of a slide. This 
allows a slide to pass arbitrary data to the layout. What data to pass depends 
on the layout.  For example, the `Columns` layout can be configured to use a 
different column divider:

```yaml
---
layout: Column
layout_data:
  divider: '<myDivider>'
---
This is the first column
<myDivider>
This is the second column
```

#### Master layout

As layouts define the structure of a slide, the master layout defines the
structure of the whole page. The [default master layout][master layout] doesn't
do much: It renders a table-of-contents/progress component and the current
slide.

The default master layout is copied into the project folder so you can 
customize it more easily.

### Content types

Layouts primarily describe how a slide is structured. While there can be 
layouts that expect the content in a specific format/language (the 
`JavaScriptExercise` layout expects the content to be JavaScript), there are 
usually parts that allow you to write content in any format you like.

You can decide which markup language to use for such content, e.g. Markdown, 
HTML or something else. All you need is a function that can convert the content 
to something renderable in React (string, React component, etc).

exerslide provides support for HTML and Markdown out of the box (via plugins).

#### Content type inference

Which converter to use is determined by:

1. The `content_type` option in the front matter. This allows you to set the 
   type explicitly. The value is usually a media type name. (this is not 
   common)
2. The file extension. If `content_type` is not specified, the media type of 
   the file is determined from the file extension. E.g. we get 
   `text/x-markdown` for an `*.md` file.


### Content type resolution

Like with layouts, exerslide will automatically look for matching content type 
converters in the project itself and any loaded plugin. It will look for 
matching files in the `contentTypes` folder.

E.g. if the slide contains

```yaml
---
contentType: text/x-markdown
---
```

and the `exerslide-plugin-markdown-converter` plugin is loaded, it will look 
for 

- `./contentTypes/text_x-markdown.js`
- `exerslide-plugin-markdown-converter/contentTypes/text_x-markdown.js`.

**Note:** Just like for layouts, you can prefix the type name with a plugin 
name (`<pluginName>:<typeName>`) to avoid conflicts.

### Styles

CSS dependencies are bundled into two CSS files:

- One file contains the CSS dependencies of React components (such as for 
[codemirror][]) and layouts. If a React component has CSS dependencies then 
usually because it doesn't function properly without it.

- The other file bundles the CSS listed in `exerslide.config.js`, 
`stylesheets`.

  ```js
  // exerslide.config.js
  module.exports = {
    stylesheets: [
      'bootstrap/dist/css/bootstrap.css',
      '...',
      './css/style.css'
    ]
  };
  ```

  The default setup includes [Foundation][], [font-awesome][] and a 
  [highlight.js][] theme.
  You can adjust these entries to your needs.

[codemirror]: http://codemirror.net/
[foundation]: http://foundation.zurb.com/
[font-awesome]: https://fortawesome.github.io/Font-Awesome/
[highlight.js]: https://highlightjs.org/

## Configuration

As mentioned earlier, exerslide is configured through `exerslide.config.js` and
`webpack.config.js`. You can edit any of them to adjust the build process to 
your liking.

### `exerslide.config.js`

This file contains settings for exerslide itself. It primarily defines paths 
and settings for the exerslide's slide loader.

- `stylesheets`: An array of paths to stylesheets that should be bundled with 
the presentation.
- `defaultLayouts`: An object that maps file extensions to layout names.
- `plugins`: A list of module names to load as plugins. `exerslide-plugin-` can 
be omitted from the name. Plugins are intended to provide additional layouts, 
content type converters, or other functionality.

Settings you probably won't have to change:

- `out`: Absolute path to the output directory.
- `slidePaths`: A list if patterns that will match all slide files. These 
patterns are used by to watch for new and deleted slides.
- `processSlides`: A function to process the list of paths matched by 
`slidePaths`. This can be used to filter out or reorder files.

### `webpack.config.js`

Basically a standard webpack configuration file, with sensible default 
settings. exerslide will augment this configuration with additional options to 
ensure that the build process runs properly.

The configuration object contains an additional `slideLoader` option with which 
custom slide transformers can be specified.

## CLI 

### `exerslide init`

Initializes a new presentation project.

#### `exerslide build [OUT_DIR]`

Builds the presentation. If `OUT_DIR` is present, it will save the presentation 
in that folder instead of what is configured in `exerslide.config.js`.

#### `exerslide watch [OUT_DIR]`

Continuously builds the presentation. If `OUT_DIR` is present, it will save the 
presentation in that folder instead of what is configured in 
`exerslide.config.js`.

#### `exerslide serve`

Starts a web server for local development and rebuilds the presentation when 
any slide or other dependency (JavaScript files, layout, CSS) changed.

## Plugins

Plugins are intended to provide additional layouts, content type converters and 
other functionality. When looking for layouts or content type converters, 
exerslide will look into each plugin's `layouts/` and `contentTypes/` folders.

Additionally, if the plugin has a `init.js` file in its root folder, which 
exports a function, the function will be called and gets passed the exerslide 
config and webpack config objects. This allows plugins to add additional slide 
transforms or update the webpack configuration.

The default layouts and content converters which are coming with exerslide are 
implemented as plugins. Have a look at the [packages](packages/) folder for 
examples.

[webpack-config]: ./packages/exerslide-cli/scaffolding/webpack.config.js
[exerslide-config]: ./packages/exerslide-cli/scaffolding/exerslide.config.js
[index.html]: template/index.html

[master layout]: ./packages/exerslide-cli/scaffolding/js/components/MasterLayout.js
[React]: http://facebook.github.io/react/
[yaml]: https://en.wikipedia.org/wiki/YAML
[lodash]: https://lodash.com/
[default key map]: ./packages/exerslide-cli/scaffolding/js/keyMap.js
[webpack]: http://webpack.github.io/
