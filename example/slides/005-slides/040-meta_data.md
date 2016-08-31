---
id: metadata
title: Metadata reference
---

The following configuration options are recognized by exerslide. We use [snake 
case][] for some options because it works better with screenreaders.

## `layout_data`

The most important option. `layout_data` can contain arbitrary data, which is 
passed to the layout of the slide. Which value to specify depends on the layout 
that is used, but most of the time it will be an object.

### Example

The "Column" layout allows you specify the delimiter for distinguishing columns
in the `delimiter` option:

::: a11y
```yaml
---
layout: TwoColumn
layout_data:
  delimiter: "+++",
---
First column
+++
Second column
```

```yaml
---
{
  layout: TwoColumn,
  layout_data: {
    delimiter: "+++",
  }
}
---
First column
+++
Second column
```
:::

## `title`

The title is shown above the slide content and used in the table of contents if 
`toc` isn't specified. The value is a string.

### Example

::: a11y
```yaml
---
title: "The slide title"
---
```

```yaml
---
{
  title: "The slide title"
}
---
```
:::

## `toc`

The "name" to show in the table of contents (instead of `title`). Also a 
string.

### Example

::: a11y
```yaml
---
title: "A very long slide title"
toc: "Shorter title"
---
```

```yaml
---
{
  title: "A very long slide title",
  toc: "Shorter title"
}
---
```
:::

## `id`

A unique identifier that can be used to link to the slide (instead of using the 
slide index, which may change). The value is a string.

### Example

::: a11y
```yaml
---
id: intro
---
```

```yaml
---
{
  id: intro
}
---
```
:::


## `layout`

The name of the layout to use for the slide. The layout name can be prefixed by
by a [plugin](#plugins) name (e.g. `center-layout:Center`) to avoid ambiguity.  
The value is a string.

### Examples

::: a11y
<div>

```yaml
---
layout: Center
---
```

```yaml
---
layout: center-layout:Center
---
```

</div>

<div class="accessible-example">

```yaml
---
{
  layout: Center
}
---
```

```yaml
---
{
  layout: center-layout/Center
}
---
```

</div>
:::

## `content_type`

Specify the type of the free text and therefore which content type converter to 
use. Similar to the `layout` option, the name can be prefixed with a plugin 
name. 

### Examples

:::a11y
<div>

```yaml
---
content_type: text/html
---
```

```yaml
---
content_type: myPlugin:text/html
---
```

</div>

<div>

```yaml
---
{
  content_type: text/html
}
---
```

```yaml
---
{
  content_type: myPlugin:text/html
}
---
```

</div>
:::

## `style`

CSS that is added to the page when the slide is shown. This allows for easy 
customization of single slides. The value is a string.

### Example

::: a11y
```yaml
---
style: |
  #slide {
    color: read;
  }
---
```

```yaml
---
{
  style: "
    #slide {
      color: read;
    }"
}
---
```
:::

## `class_names`

An array of CSS class names that are added to the page. This allows to reuse 
styles for multiple styles.

### Example

::: a11y
```yaml
---
class_names: [importantSlide]
---
```

```yaml
---
{
  class_names: [importantSlide]
}
---
```
:::

Rules for `.importantSlide` can be defined in a custom CSS stylesheet (see 
[configuration](#/exerslide.config.js)).

## `hide_toc`

If present and set to `true`, the table of contents will be automatically 
collapsed. Note that this only has an effect if the visitor hasn't opened or 
closed the table of contents themselves.

### Example

::: a11y
```yaml
---
hide_toc: true
---
```

```yaml
---
{
  hide_toc: true
}
---
```
:::

## `scale`

**Note:** This option can only be set on the first slide.

Exerslide automatically adjusts the font size for different screen widths to 
ensure that the slides are always readable. `scale` lets you customize the 
behavior to some degree.

- `false`: If set to `false`, no adjustments will be made
- `Object`: Otherwise the value can be object with up to three properties:
  - `content_width`: Specifies the content width in `em`s. This can be thought 
  of as how many characters per line should be shown.
  - `column_width`: A number between 0 and 1. How much of the screen (width) 
  should be occupied by the content.
  - `max_font_size`: A number that specifies the maximum font size to use (in 
  pixels). 

### Examples

#### Disable font scaling

::: a11y
```yaml
---
scale: false
---
```

```yaml
---
{
  scale: false
}
---
```
:::

#### Change the width of the content column and the max font size

::: a11y
```yaml
---
scale:
  column_width: 0.666
  max_font_size: 48
---
```

```yaml
---
{
  scale: {
    column_width: 0.666,
    max_font_size: 48
  }
}
---
```
:::
