---
id: docs
title: Structure of a slide
chapter: Making Slides
---
Each slide or page is created from a **text file**. Each file can contain a 
metadata header, delimited by lines containing only `---`.
The metadata header is expressed in [YAML][]. You may already be familiar with 
this if you used other static site generators.

<div class="callout primary">

  **Note:** Depending on how you write YAML, whitespaces and indentation can be 
  important. Screenreaders might not support these very well though, which can
  complicate creating slide headers. Because of this we are providing 
  additional examples of slide headers with extra punctuation that better 
  indicate where new lines and values start. Select the "Show accessible 
  version" before each example to enable it.
  See [YAML language 
  elements](https://en.wikipedia.org/wiki/YAML#Language_elements) for more 
  information.

</div>


### Example

::: a11y
```yaml
---
title: "This is the metadata section"
---
Here is the content
```

```yaml
---
{
  title: "This is the metadata section"
}
---
Here is the content
```
:::

## Metadata

See [](#/metadata) for a full list of metadata options. In the above example, 
the `title` option defines the title to render above the content and in the 
navigation section.

## Content

Out of the box, exerslide supports slides written in HTML or Markdown, but with 
the right plugin it could be something else completely. How to *structure* the 
content primarily depends on the **[layout](#/layouts)** that is used to render 
the slide. We will talk about this more in the following slides.
