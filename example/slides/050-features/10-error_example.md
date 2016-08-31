---
title: Error slides
style: |
  #exerslide-slide pre > code {
    font-size: 0.8em;
  }
---
If the build process isn't able to parse the YAML front matter of a slide or
encounters an unknown slide option, exerslide will generate a slide that 
contains information about the error, and the original source.

## Examples

The slide

::: a11y
```yaml
---
title: Broken: example
---
This examples contains broken YAML to demonstrate how broken slides are
rendered.
```

```yaml
---
{
  title: Broken: example
}
---
This examples contains broken YAML to demonstrate how broken slides are
rendered.
```
:::

would result in a slide showing the error

```
incomplete explicit mapping pair; a key node is missed at line 1, column 14:
    title: Broken: example
                     ^
```

The slide

::: a11y
```yaml
---
titel: Some title
---
Some content
```

```yaml
---
{
  titel: "Some title"
}
---
Some content
```
:::

would result in a slide showing the error

```
Error: Unknown option "titel". Did you mean "title" instead?
```
