---
title: Interslide references
---

To make linking between slides easier, every slide can have an ID and you can 
use that ID instead of the slide number (which may change as you create the 
presentation).

## Example

If a slide has the `id` key in the front matter:

::: a11y
```yaml
---
id: example
title: "Some title"
---
Some content
```

```yaml
---
{
  id: example,
  title: "Some title"
}
---
Some content
```
:::

Then you can refer to it from any page using the ID in the hash of the URL 
instead of the slide number.

### Markdown example

```markdown
[See this slide](#/example)
```

### HTML example

```html
<a href="#/example">See this slide</a>
```
