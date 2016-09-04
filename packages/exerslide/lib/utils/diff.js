/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const colors = require('colors');
const diff = require('diff');
const editor = require('editor');
const fs = require('fs');
const path = require('path');
const temp = require('temp').track();

/**
 * Print a diff of the existing file and the default file to the console.
 */
exports.printDiff = function(targetPath, oldContent, sourcePath, newContent) {
	const patch = diff.structuredPatch(
    relative(targetPath),
    relative(sourcePath),
    oldContent,
    newContent
  );
  process.stdout.write(colors.red(`--- ${patch.oldFileName}\n`));
  process.stdout.write(colors.green(`+++ ${patch.newFileName}\n`));
	patch.hunks.forEach(h => {
		process.stdout.write(
			`@@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@\n` // eslint-disable-line comma-spacing
		);
		h.lines.forEach(line => {
			switch (line[0]) {
				case '+':
					line = colors.green(line);
					break;
				case '-':
					line = colors.red(line);
					break;
			}
			process.stdout.write(line + '\n');
		});
	});
}

/**
 * Open the author's default editor and edit the diff of the files.
 */
exports.editDiff = function(fileExtension, oldContent, newContent) {
  return new Promise((resolve, reject) => {
    const file = temp.path({suffix: '.patch'});
    const stream = fs.createWriteStream(file);
    diff
      .diffLines(oldContent, newContent)
      .forEach(function(part){
        const value = part.value.replace(
          /^(?=.)/mg,
          part.added ? '+' : part.removed ? '-' : ' '
        );
        stream.write(value);
      });
    stream.end();
    stream.on('close', () => editor(file, code => {
      // Apply the "patch"
      const content = fs.readFileSync(file).toString()
        .replace(/^-[^\r\n]*\r?\n?/gm, '')
        .replace(/^[+ ]/gm, '');
      if (code === 0) {
        resolve(content);
      } else {
        reject(null);
      }
    }));
  });
}

function relative(p) {
  return path.relative(process.cwd(), p);
}
