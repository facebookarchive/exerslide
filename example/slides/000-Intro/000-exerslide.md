---
title: exerslide
chapter: Exerslide
toc: What is exerslide?
hide_toc: true
style: |
  #exerslide-slide h1#exerslide-slide-title {
    font-size: 2.5rem;
    text-align: center;
  }
  #exerslide-slide {
    padding-bottom: 20px;
  }
---

exerslide is a presentation / tutorial generation tool which converts a set of 
files into a self-contained HTML page. It uses [webpack][] and [React][].

## Features

### Content first

Creating the content of a slide should be as easy as possible. You should be 
able to focus on **what** to write, not get distracted by *how* it looks. 

Every slide is represented by a (text) file, written in your favorite markup 
language (e.g. [Markdown][]). The content (and metadata) is passed to a 
*layout*, which determines *how* the slide looks like and what it can do.

Each slide can have its own layout, and more importantly, layouts are easy to 
create and can be shared.

### Customization

exerslide tries to provide sensible defaults for overall page structure, 
layouts and CSS, while also providing a wide range of customization options,
from simple CSS changes to elaborate build process changes.

### Accessibility

All the components coming with exerslide pay special attention to 
accessibility. exerslide presentations work well with screen readers, whether 
you read the presentation or give it.

### Short feedback cycle

Because exerslide uses [webpack][], it comes with a development server built 
in. Whenever you change one of your slides or presentation code, the browser 
will automatically reload the presentation.

<a
  class="primary button"
  style="text-align: center;margin-top: 1.5em;display: block;"
  href="#/get_started">
  Get started!
</a>
