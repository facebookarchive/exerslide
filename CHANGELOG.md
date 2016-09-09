# Changelog

Changelog for all packages in this repo. The tags and [GitHub 
releases](https://github.com/facebookincubator/exerslide/releases) only reflect 
the status of the `exerslide` package.  To save space, `exerslide-plugin-*` 
prefix is omitted from package names

## exerslide-cli v1.1.0 (2016-09-09)

### New

- Friendlier output: More information about the current status as well as 
suppressing the standard output of `npm install exerslide`. To see the full 
output, pass `--verbose` (2b33dc3).

### Fixed

- Global `exerslide init` command correctly forwards arguments to local
`exerslide init` (2b33dc3)

---

## exerslide v1.1.2 (2016-09-09)

### New

- When copying the template files into the project, the license header is
removed (431ec6d)

### Fixed

- `exerslide build`. Multiple issues caused `exerslide build` to not work and to
obscure the actual issue
  - `error.module.resource` does not always exist, causing an error in the
  builder itself (84c6aec)
  - The babel loader was unexpected picking up exerslide's own `.babelrc` files,
  which caused errors (    bcc9c00)
  - `exerslide init <project name>` didn't correctly pass the project name to
  the scaffolder, causing the generation of invalid files (c839be2, 986e07b)

- `highlight.js` was missing from projects dependencies but is required since it
is referenced in `exerslide.config.js`. This would have caused problems on npm 
v2, but not npm v3. (a09e7b6)

### Upgrade instructions

For existing projects, run 

```
npm update --save exerslide
```

in the project directory.

If you are using npm@2 then you should also run

```
npm install --save highlight.js
```

to get fix the dependencies.

If you want you can also run

```
exerslide copy-defaults
```

to get the latest version of the template files, which in this case means
removing the copyright header from the files.

---

## exerslide v1.1.1 (2016-09-08)

- `<TOC />` didn't pass the right arguments to the layout's `getClassNames` 
  method (c5ce9de).

---

## exerslide v1.1.0 (2016-09-07)

There are quite a few changes in this release please refer to the commit message for more information.

### New

#### CLI

- `exerslide init` suppresses `npm install` output. You can get by passing
`--verbose` (abb6be6)

- `exerslide serve` suppresses the default output of the webpack dev server.
It will show more friendly    output of the errors. You can get the raw output
with `--verbose`. `exerslide build` and `exerslide watch` do something similar
for the normal webpack command (14cdc1c)

- `exerslide serve` now has a new options `--no-open-browser` prevents exerslide
from opening your browser

- **Better file conflict handling with `exerslide copy-defaults`**. We are now
storing a hash of the template file content in the copy in the project directory.
This allows exerslide to check which version your copy is based on and can 
avoid asking you to update the copy if the copy has custom changes but the 
template hasn't updated. This behavior can be suppressed by passing 
`--ignore-file-hash` to the command. (f1acb06)

- **Better diff editing.** Before, every line that add a patch indicator 
(`-`/`+`) to be resolved. Now you just have to edit the files you want to keep 
or not add: Replace `-` with ` ` (space) if you want to keep the line, remove 
`+` lines if you don't want to add this line. All other lines will be resolved 
automatically. (013d1f6)

- `exerslide copy-files` has two new options:
  - `--overwrite-all` will override your copies with the original template 
  files. **Note:** This will override your changes to those files and you 
  should only use this command if you use version control or have a backup of 
  that file.
  - `--confirm=false` (default: `true`) disables confirmation of how to handle 
  conflicts. If there are conflicts, the version in the project folder will be 
  kept.

#### Template files / project structure

- Default CSS file for custom rules. exerslide now generates an empty CSS file 
`css/<projectname>.css` where you can put custom rules. This file is included 
by default, so the configuration file doesn't have to be edited. (69de989)

- A new file, `exerslide-help.md`, is copied into new projects. This file 
contains short instructions for common tasks, such as adding custom CSS styles.  
(d17d9fd)

#### Components

- The `<Slide />` component can now be rendered more than once on a page.  
  However, there can still only be a single "active" slide. In addition to 
  `SLIDE.DID_MOUNT` and `SLIDE.WILL_UNMOUNT`, slides also emit the 
  `SLIDE.ACTIVE` and `SLIDE.INACTIVE` events. They also pass down `isActive` as 
  context.  (69de989)

### Changed

#### Template files / project structure

- `statics/` folder was removed. `static/index.html` was moved to `index.hml` 
and we are using 
[`html-webpack-plugin`](https://github.com/ampedandwired/html-webpack-plugin) 
to copy and prepare the `index.html` file. (1ff2385)

- The default CSS file, `css/styles.css`, has been renamed to 
`css/exerslide.css` (69de989)

- **No IDs in default stylesheet rules.** Using IDs makes it hard to override 
these rules in custom stylesheets. We have to use IDs for some elements for 
accessibility, but we don't have to use them for CSS rules. **Note:** If you 
have been using these IDs in custom stylesheets, you have to update these 
rules! (47e6860, 66f9875)  The following elements have been renamed:
  - `#exerslide-slide` -> `.exerslide-slide`
  - `#exerslide-slide-title` -> `.exerslide-slide-title`
  - `#exerslide-toc-list` -> `.exerslide-toc-list`
  - `.exerslide-toc-title` -> `.exerslide-toc-heading`
  - `#exerslide-toc-title` -> `.exerslide-toc-title`


### Fixed

#### Components

- Using multiple `<Slide />` components in the page didn't work properly 
  because some descendants of `<Slide />` would get slide data via the 
  *context*.  The context however would contain the data of the current 
  "active" slide.  `<Slide />` is now a context provider passing down the slide 
  data it gets passed as props (i.e. the data it is supposed to render). 
  (47e6860)

- Plugins that added wrappers to `<ExtensionPoint />`s weren't able to access 
the props of the component they are supposed to wrap. These props are now 
passed to the wrapper component and it is expected that it passes them along to 
its child. (209fb8c)

### Upgrade instructions for existing projects

Run

```
npm install --save exerslide@latest
```

Run 

```
exerslide copy-defaults
```

to get the latest versions of the template files. Review the changes to each 
file (press 5 (View diff)) and either accept them (press 3 (Overwrite)) or edit 
them to preserve custom changes (press 6 (Edit diff)). With these changes a 
signature of the original template file is inserted, which helps to make future 
updates to the files less annoying (see notes above).

#### Custom CSS rules

If you have custom CSS rules and are targeting any of the following classes, 
you have to update your rules:

  - `#exerslide-slide` -> `.exerslide-slide`
  - `#exerslide-slide-title` -> `.exerslide-slide-title`
  - `#exerslide-toc-list` -> `.exerslide-toc-list`
  - `.exerslide-toc-title` -> `.exerslide-toc-heading`
  - `#exerslide-toc-title` -> `.exerslide-toc-title`

#### Location of custom CSS rules

Since exerslide now generates an empty CSS file for your custom rules, you 
*can* move your rules there but you don't have to. If you do, make sure 
`exerslide.config.js` is updated via `exerslide copy-defaults`.

#### `index.html` and other static files

The `statics/` folder is gone. If you made any custom changes to 
`statics/index.html`, you have to apply them to the new `index.html` file. If 
you have other static files that need to be available in the output folder, you 
can either reference them somehow in your slides or `index.html` so that 
webpack will copy them, or use a plugin such as 
[copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin).

---

## exerslide v1.0.2, markdown-converter v1.0.1 (2016-08-31)

- Avoid using spread and rest to be able to run in Node v4 
(40ce45b82fc078aedbfe30bffac74fc2246e49cc).

---

## exerslide v1.0.1 (2016-08-31)

- Fix forward and back buttons in toolbar. They hadn't been working due to API 
changes. (313ffc395c1ef8b1b02efc40993d8f55bff0d5cb)

---

## 2016-08-31

- Initial release
