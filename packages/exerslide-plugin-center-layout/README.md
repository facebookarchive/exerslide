# Center layout
Layout that horizontally and vertically centers its content.

```
 +-----------------------+   +-----------------------+   +-----------------------+
 |                       |   |                       |   |                       |
 |                       |   |   +---------------+   |   |   +---------------+   |
 |                       |   |   |               |   |   |   |               |   |
 |     Centered Text     |   |   |               |   |   |   | Centered Text |   |
 |                       |   |   |               |   |   |   |               |   |
 |                       |   |   +---------------+   |   |   +---------------+   |
 |                       |   |                       |   |                       |
 +-----------------------+   +-----------------------+   +-----------------------+
```

## Layout data

 - `image`: A path/URL to an image or an image object (`{src: ..., alt: ...}`)

If `image` is specified but no content, the image will be centered.
If both `image` and content are specified, the image becomes the centered
background-image of the slide.

## CSS classes

The content is wrapped in the CSS class `.Center-wrapper`.

## Examples

### Simple text content

```yaml
---
title: Center layout example
layout: Center
---
With subtitles
```

### Centered image

```yaml
---
toc: Center layout image example
layout: Center
layout_data:
  image:
    src: http://placehold.it/500x300/A8C5FC/?text=+
    alt: Center layout showing a centered image
---
```

### Full-screen background image and text

Exerslide tries to provide a minimal set of styles and to give you the 
possibility to customize almost anything. Having a fullscreen slide is 
relatively easy to achieve: just write some custom CSS that expands the width 
of the slide. If you find yourself doing this often, you can use your own 
helper class.

```yaml
---
title: Full screen example
layout: Center
hide_toc: true
style: |
  .Center-wrapper {
    background-size: contain !important;
    max-width: 100% !important;
  }
  #exerslide-slide {
    color: white;
    padding: 0;
  }
  #exerslide-slide > * {
    max-width: 100% !important;
  }
layout_data:
  image: http://placehold.it/500x300/A8C5FC/?text=+
---
```
