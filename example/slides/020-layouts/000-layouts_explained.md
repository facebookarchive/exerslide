---
id: layouts
title: What are layouts?
chapter: Layouts
---

Layouts define how the content of a single slide is **structured**. They are 
implemented as [React][] components and can therefore be arbitrarily complex.

Layouts receive the content of a slide but also any data defined in 
`layoutData` in the front matter of the slide.

Because layouts are independent React components, they can be easily shared via 
plugins.  Exerslide doesn't include any layouts itself, but it comes 
pre-configured with some plugins which provide the following layouts:

- **Center**: Centers the content vertically and horizontally on the screen
- **Column**: Shows content side be side
- **BulletList**: Renders a list of revealing bullet points

## Layout resolution

Which layout to use for a slide is determined in a couple of ways:

### Per slide layout

Slides can specify in the meta-data section which layout to use, via the
`layout` option. The following example slide source would specify to use the
"Center" layout:

::: a11y
```
---
layout: Center
---
Some content that is going to be centered
```

```
---
{
  layout: Center
}
---
Some content that is going to be centered
```
:::

### Default layouts

Having to specify they layout for every slide explicitly is not convenient. To 
make this easier, exerslide uses the **file extension** of the slide source file to
determine the layout. The file extension to layout mapping can be configured in
the [configuration file](#/config_file). For example, we could define the 
following map so that files with the extension `.center.md` get rendered with 
the `Center` layout:

```
{
  "fileTypeToLayoutMapping": {
    ".center.md": "Center"
  }
}
```
