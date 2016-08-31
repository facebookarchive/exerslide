---
title: Building your presentation
---

When generating (building) the presentation, exerslide takes all of the slides, 
JavaScript, CSS and image files and creates a standalone HTML page from them.

exerslide uses [webpack][] to generate the final version of the presentation. 

## `exerslide build`

This will generate a "production" version of the presentation and store it in 
the output folder specified in `exerslide.config.js` (default: `./out`).

## `exerslide serve`

This starts webpack's development server and opens your default browser.  
Changes to slide, JavaScript or other files will automatically reload the site.
