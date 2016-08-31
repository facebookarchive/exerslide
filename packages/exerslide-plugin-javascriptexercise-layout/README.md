# JavaScriptExercise layout

This layout is intended for interactive JavaScript exercises. It shows a text 
editor to let the visitor input JavaScript and allows to specify validation 
logic to verify the solution.

```
+-----------------------+
|                       |
|   Description         |
|   +---------------+   |
|   |               |   |
|   |Editor         |   |
|   |               |   |
|   +---------------+   |
|   +------+ +-----+    |
|   |Submit| |Reset|    |
|   +------+ +-----+    |
+-----------------------+
```

Code that is inputted in the text editor can be executed and verified. The 
layout makes a special function available to the code in the editor: `log`.  
`log` is a wrapper around `console.log` which also records the values that have 
been passed to it. These values can later be used to validate solutions.

## Layout data

- `description`: Free form text that will be shown above the text editor. Can 
be used to introduce the question / problem.
- `assertion`: JavaScript code to validate the solution. The code has access to 
three variables:

  - `assert`, which is the assertion function. It takes a condition as first 
  argument and a message as second argument.
  - `source`: The text editor input.
  - `output`: An array of values which have been passed to the `log` function.

 With this you can perform simple checks against the input source and logged 
 output.

**Note:** If `assertion` is not present, no "Submit" button is rendered. In 
that case the layout can used as interactive demo.

## Layout content

The content of the slide is expected to be JavaScript and is used as the 
initial input of the text editor.

## Example:

```
---
title: Exercise
layout_data:
  description: |
    Create a local variable with name `foo` and value `42`.
    Use `log(foo)` to log the value of `foo`.
  assertion: |
    assert(
      /var foo\s*=.+;?$/m.test(source),
      "It doesn't look like you have declared a variable (hint: var)."
    );
    assert(output[0] === 42, "Don't forget to log the value");
---
// Create variable

//
log(foo);
```
