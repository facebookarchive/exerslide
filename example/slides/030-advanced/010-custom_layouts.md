---
title: Custom layouts
chapter: Customization
id: custom_layouts
---

You can also create your own layouts.  Exerslide was originally developed to 
create interactive presentations for teaching web technologies. It comes with 
some reusable components to support such use cases.

The next slide shows a custom layout that renders its content in a text editor
and renders the input as HTML next to it.
If it also implemented validation logic and user feedback, this could be used
to create interactive exercises.

## Where to store custom layouts

For exerslide to be able to find the layout, it has to be stored inside the 
`layouts/` directory in your presentation (create the directory if it doesn't 
exist):

```
- presentation/
  - layouts/
    - Editor.js
  - slides/
    - 00-slide1.md
    - 01-slide2.md
  - exerslide.config.js
  - webpack.config.js
```

## Example

The layout used in the next slide is defined as

```javascript
@require('!!raw!../../layouts/Editor.js')
```
