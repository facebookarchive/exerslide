---
id: get_started
title: Get started
---

exerslide is a set of [React][] components, JavaScript modules, and [webpack][] 
configuration files. The **command line tool** will copy these files into the 
project folder upon initalization.

0. Install [Node][] if you haven't already (consider using [nvm][] for simpler 
   installation).

1. Install `exerslide-cli`.
  ```bash
  npm install -g exerslide-cli
  ```

2. Create a new directory for your project and change into that directory.
  ```bash
  mkdir myPresentation
  cd myPresentation
  ```

3. Initialize a new project. This will copy all necessary configuration and 
   JavaScript files which you can edit later, and install all dependencies.
  ```bash
  exerslide init MyPresentation
  ```

4. Start the local server. This will start webpack's development server and 
   opens your default browser. Changes to slides or JavaScript files cause the 
   browser to refresh.
  ```bash
  exerslide serve
  ```

5. Add/edit slides in `slides`.
