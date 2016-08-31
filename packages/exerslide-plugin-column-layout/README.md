# Column layout

This layout renders its content in two or more columns, looking something like

```
+-----------------------+   +-----------------------+
|                       |   |                       |
|                       |   |                       |
|                       |   |             +------+  |
|    Text       Text    |   |    Text     |      |  |
|                       |   |             +------+  |
|                       |   |                       |
|                       |   |                       |
+-----------------------+   +-----------------------+
```

The content is provided via `layoutData`.

## Layout data

This layout accepts the following options:

- `divider`: A string that is used to separate the columns in the content. 
  Defaults to `###`. The divider must be always alone in one line.
- `alignment`: An array of alignments corresponding to each column. This 
  defines the *horizontal* position of the content and can be either `left` 
  (default), `center` or `right`.  Example: `[left,
right]`.
- `position`: An array of positions corresponding to each This defines the 
*vertical* position of the content in the column, and can be either `top` 
(default), `middle` or `bottom`. Example: `[top, middle]`. `middle` and 
`bottom` will align the content relative to the largest column.

## Layout content

The content consists for several blocks of text (one block per column) 
separated by the divider. For example:

```
This is the left column.
###
This is the right column.
```

## CSS classes

Each column has the class `.Column-column`. Columns are wrapped inside an 
element with class `.Column-wrapper`. Each column gets assigned a class 
containing its index, e.g. `.Column-1` for the first column, `.Column-2` for 
the second column, and so on.

Each alignment and position also adds a class to each column element (e.g.  
`.Column-left`, `.Column-middle`, etc.).  You can use these classes to override 
the default behavior.

Columns have a default `min-width` of `150px`. You can set a column to a 
specific width using

```yaml
style: |
  .Column-1 {
    min-width: 50px;
    max-width: 50px;
  }
```

(which sets the width of the first column to `50px`)

**Note:** If you have more than two columns, you likely want to override the 
`max-width` of `#exerslide-slide > *`, e.g. with

```yaml
style: |
  #exerslide-slide > * {
    max-width: 80%;
  }
```

## Example

```yaml
---
id: two_column_example
title: TwoColumn layout example
layout: TwoColumn
layout_data:
  alignment: [left, center]
  position: [top, middle]
---
This is an example that shows text content on the left and a picture on
the right.

Example with [Markdown][]:
- For example:
- bullet lists

Check out the image on the right.
###
![Example image on the right hand side](http://placehold.it/200x150/A8C5FC/?text=+)
```
