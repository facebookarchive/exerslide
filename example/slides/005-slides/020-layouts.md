---
title: Layouts
---

You are probably familiar with the concept of layouts from existing 
presentation software products. Layouts define how a slide is structured.

In exerslide, layouts are implemented as [React][] components. The component 
gets passed the slide content and other metadata. See [](#/layouts) for more 
details.

Which layout to use for a slide can be configured in the metadata section via 
the `layout` option:

::: a11y
```yaml
---
title: "Example title"
layout: Center
---
Example content
```

```yaml
---
{
  title: "Example title",
  layout: Center
}
---
Example content
```
:::

Because layouts are React components, i.e. implemented in JavaScript, they can 
enable interactive experiences.
