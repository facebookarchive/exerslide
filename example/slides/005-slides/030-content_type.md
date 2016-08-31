---
id: content-type
title: Content types
---

Earlier we said the content of a slide can be anything and written in any 
markup language. Wherever you can provide free content/text, you can use your 
preferred markup language, as long as you have the correct **converter**. Out 
of the box, exerslide comes with an **HTML** and a **Markdown** converter which 
should satisfy most use cases.

**Note:** Layouts can require the content to be in a specific format or of a 
specific type.

## Type inference

The content type of a slide is determined from the file extension, or can be 
explicitly set in the front matter through the `content_type` option:

::: a11y
```yaml
---
title: "Some slide"
content_type: text/html
---
<p>Content</p>
```

```yaml
---
{
  title: "Some slide",
  content_type: text/html,
}
---
<p>Content</p>
```
:::

When inferred from the file extension, exerslide will use the (standardized) 
[media type][] name to find the correct converter. For example:

- `*.md` files: `text/x-markdown`
- `*.html` files: `text/html`
