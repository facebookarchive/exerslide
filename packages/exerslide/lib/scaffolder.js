/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const colors = require('colors');
const copyDir = require('./fs/copyDir');
const diff = require('diff');
const editor = require('editor');
const pathExists = require('./fs/pathExists');
const fs = require('fs');
const inquirer = require('inquirer');
const isTextPath = require('is-text-path');
const path = require('path');
const temp = require('temp').track();
const template = require('lodash.template');

const SCAFFOLDING_PATH = path.join(__dirname, '../scaffolding');
const APPLY_TEMPLATE_TO = [
  /package.json$/,
  /\/statics\//,
];

/**
 * This module is responsible for initializing an exerslide project, i.e.
 * primarily copying the scaffolding/example files to the target location
 * (current directory).
 *
 * It doesn't just copy the files, it also gives the author options to resolve
 * conflicts if a file already exists and contains different content.
 */
module.exports = function scaffolder(targetDir, options, done) {
  let filesToIgnore = [/.eslintrc.yml$/];
  if (pathExists(path.join(targetDir, 'slides'))) {
    // slides directory exists, so don't copy the default one
    filesToIgnore.push(/\/slides\//)
  }
  if (pathExists(path.join(targetDir, 'references.yml'))) {
    filesToIgnore.push(/references.yml$/);
  }

  if (!options.name) {
    // Try to get name from package.json if it exists
    try {
      const pkg = require(path.join(process.cwd(), 'package.json'));
      options.name = pkg.name;
    } catch (err) {
      //  Do do anything if it doesn't exist
    }
  }

  function transform(sourcePath, targetPath, contents) {
    if (APPLY_TEMPLATE_TO.some(pattern => pattern.test(sourcePath)) &&
      isTextPath(sourcePath)
    ) {
      return template(contents.toString())({name: options.name || ''});
    }
    return contents;
  }


  const emitter = copyDir({
    sourceDir: SCAFFOLDING_PATH,
    targetDir,
    ignorePatterns: filesToIgnore,
    transform,
    ask: processFile,
  });
  emitter.on('copy', (sourcePath) => {
    log(`Copied "${path.relative(SCAFFOLDING_PATH, sourcePath)}".`);
  });
  emitter.on('skip', (sourcePath) => {
    log(`Skipped "${path.relative(SCAFFOLDING_PATH, sourcePath)}".`);
  });
  emitter.once('error', done);
  emitter.once('finish', done);
};

function log(msg) {
  process.stdout.write(msg + '\n');
}

/**
 * Ask the author how to proceed if a file already exists but has different
 * content.
 */
function ask(fileName) {
  return inquirer.prompt(
    [{
      type: 'rawlist',
      message: `File "${fileName}" contains custom/different code. ` +
        'What do you want to do?',
      name: 'action',
      default: 0,
      choices: [
        {
          name: 'Keep current file',
          value: 'keep',
        },
        {
          name: 'Keep current file and all next',
          value: 'keep_all',
        },
        {
          name: 'Overwrite',
          value: 'overwrite',
        },
        {
          name: 'Overwrite this one and all next',
          value: 'overwrite_all',
        },
        {
          name: 'Show diff',
          value: 'diff',
        },
        {
          name: 'Edit diff',
          value: 'edit',
        },
      ],
    }]
  );
}

/**
 * Print a diff of the existing file and the default file to the console.
 */
function printDiff(oldContent, newContent) {
  const patch = diff.structuredPatch('foo', 'bar', oldContent, newContent);
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
function editDiff(fileExtension, oldContent, newContent) {
  return new Promise((resolve, reject) => {
    const file = temp.path({suffix: fileExtension});
    const stream = fs.createWriteStream(file);
    diff
      .diffLines(oldContent, newContent)
      .forEach(function(part){
        const value = part.value.replace(
          /^(?=.)/mg,
          part.added ? '+' : part.removed ? '-' : ''
        );
        stream.write(value);
      });
    stream.end();
    stream.on('close', () => editor(file, code => {
      if (code === 0) {
        resolve(fs.readFileSync(file));
      } else {
        reject(null);
      }
    }));
  });
}

/**
 * This function is called when we are trying to copy a file that already exists
 * at the destination. In that case we provide the user various options for what
 * to do.
 */
function processFile(sourcePath, targetPath, sourceFileContent) {
  sourceFileContent = sourceFileContent.toString();
  const targetFileContent = fs.readFileSync(targetPath, 'utf-8');

  if (sourceFileContent !== targetFileContent) {
    const relativePath = path.relative(SCAFFOLDING_PATH, sourcePath);
    let overwriteAll = false;
    let keepAll = false;

    // Really hacky way to get around the fact that we initialize a project
    // with a `package.json` file that contains only {}
    if (/package\.json/.test(sourcePath) && targetFileContent === '{}') {
      return Promise.resolve({write: true});
    }

    return ask(relativePath).then(function handleAnswer(answer) {
      switch (answer.action) {
        case 'overwrite_all':
          overwriteAll = true;
        case 'overwrite': // eslint-disable-line no-fallthrough
          return {write: true, overwriteAll};
        case 'diff':
          printDiff(targetFileContent, sourceFileContent);
          return inquirer.prompt(
              [{type: 'input', message: 'continue', name: 'continue'}]
            )
            .then(() => ask(relativePath))
            .then(handleAnswer);
        case 'edit':
          return editDiff(
              path.extname(targetPath),
              targetFileContent,
              sourceFileContent
            )
            .then(
              contents => ({write: true, contents}),
              () => {
                log('\nUnknown error, skipping file.');
                return {};
              }
            );
        case 'keep_all':
          keepAll = true;
        case 'keep': // eslint-disable-line no-fallthrough
        default:
          return {write: false, keepAll};
      }
    });
  } else {
    return Promise.resolve({write: false});
  }
}
