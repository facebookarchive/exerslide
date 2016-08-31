---
title: Order and organization of slides
---
By default, the order in which the slides appear is determined by the 
lexicographical order of the file names. Aside from that you can name each file
however you want.

### Example

If your slides are in a folder with the following structure:

```
slides/
  00-intro.md
  01-example.md
  02-end.md
```

Then the order of slides will be 

1. 00-intro
2. 01-example
3. 02-end

<div class="callout primary">

  <i class="fa fa-info-circle"></i> This can be changed in `exerslide.config.js`.

</div>

## Chapters

You can group slides into chapters by putting the corresponding files into a
folder. The order of chapters is determined in the same way as the order of
slides.

### Example

```
slides/
  00-Intro/
    00-slide1.md
    01-slide2.md
  01-Chapter1/
    00-slide1.md
    01-slide2.md
```

The **name** of the chapter can be defined using the `chapter` metadata
option in the *first slide* of the chapter:

### Example

```
---
title: Some title
chapter: Intro
---
Content goes here
```
