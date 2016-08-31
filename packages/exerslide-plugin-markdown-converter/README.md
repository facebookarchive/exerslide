# Markdown converter

Converts Markdown to a React element. It is based on [markdown-it][] but 
extends the renderer to provide the following features.

## Features

### Syntax highlight

This converter uses [highlight.js][] for code block syntax highlighting. To 
keep the JavaScript bundle file size small, this plugin also includes a custom 
slide transform which looks for language names in code fences:

    ```html
    <div>HTML</div>
    ```

Only the highlight definitions for the detected languages are included.

### Slide title links

When linking to another slide (via ID (recommended) or slide number), you can 
omit the link text: `[](#/intro)`. In that case, the title of slide will be 
used as link text.

### Shared links / URLs

The markdown converter uses the `references` config option passed (by default) 
to exerslide.  This allows you do keep URLs in a single file and use them 
across multiple slides.  All you need to do is use the name / key of the URL.

Example:

`references.yml`
```yaml
markdown-it: https://github.com/markdown-it/markdown-it
```

`slide.md`
```markdown
My [markdown parser][markdown-it].
```

## Configuration

You can add plugins to the markdown parser by setting the `markdown-converter` 
option of the exerslide config. This is supposed to be a function that gets
passed an instance of the markdown parser.

Example:

`js/presentation.js`
```js
present({
  // ...
  'markdown-converter': function(md) {
    md.use(somePlugin);
  },
});
```

[markdown-it]: https://github.com/markdown-it/markdown-it
[highlight.js]: https://highlightjs.org/
