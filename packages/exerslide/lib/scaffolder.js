/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const colors = require('colors');
const crypto = require('crypto');
const copyDir = require('./fs/copyDir');
const diff = require('./utils/diff');
const pathExists = require('./fs/pathExists');
const fs = require('fs');
const inquirer = require('inquirer');
const isTextPath = require('is-text-path');
const path = require('path');
const template = require('lodash.template');

const cyan = colors.cyan;

const HASH_PATTERN = /@exerslide-file-hash (\S+)/;
const SCAFFOLDING_PATH = path.join(__dirname, '../scaffolding');
const APPLY_TEMPLATE_TO = [
  /package.json$/,
  /index\.html$/,
  /exerslide.config.js$/,
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
  if (!options.name) {
    // Try to get name from package.json if it exists
    try {
      const pkg = require(path.join(targetDir, 'package.json'));
      options.name = pkg.name;
    } catch (err) { } // eslint-disable-line no-empty
  }
  if (!options.name) {
    // Use the directory name as project name
    options.name = path.basename(targetDir);
  }

  const filesToIgnore = [/.eslintrc.yml$/, /__tests__/];
  if (pathExists(path.join(targetDir, 'exerslide.config.js'))) {
    // We already initialized this directory, so we don't need to copy some
    // files again.
    filesToIgnore.push(
      /\/slides\//,
      /references.yml$/,
      /css\/style.css$/
    );
  }

  const renameMap = {
    'css/style.css': options.name + '.css',
  };

  function transform(sourcePath, targetPath, contents) {
    contents = contents.toString();
    if (APPLY_TEMPLATE_TO.some(pattern => pattern.test(sourcePath)) &&
      isTextPath(sourcePath)
    ) {
      contents = template(contents)({name: options.name || ''});
    }
    return contents
      // cleanup file source
      .replace(
        /^.*?@remove-on-copy-start[\s\S]+?@remove-on-copy-end.*$/mg,
        ''
      )
      // inject file hash to keep track of changes
      .replace(
        '@exerslide-file-hash',
        `@exerslide-file-hash ${hash(contents)}`
      )
  }

  const emitter = copyDir({
    sourceDir: SCAFFOLDING_PATH,
    targetDir,
    ignorePatterns: filesToIgnore,
    renameMap,
    transform,
    ask: (sourcePath, targetPath, sourceFileContent) => (
      processFile(sourcePath, targetPath, sourceFileContent, options)
    ),
  });
  emitter.on('copy', (sourcePath) => {
    log(`Copied "${cyan(path.relative(SCAFFOLDING_PATH, sourcePath))}".`);
  });
  emitter.on('update-hash', (sourcePath) => {
    sourcePath = path.relative(SCAFFOLDING_PATH, sourcePath);
    log(`Marked "${cyan(sourcePath)}" as updated.`);
  });
  emitter.on('skip', (sourcePath) => {
    log(`Skipped "${cyan(path.relative(SCAFFOLDING_PATH, sourcePath))}".`);
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
      message: `It seems you edited "${fileName}".\n` +
        'Copying would remove your changes. ' +
        'What do you want to do?',
      name: 'action',
      default: 0,
      choices: [
        {
          name: 'Keep your file',
          value: 'keep',
        },
        {
          name: 'Keep all your files',
          value: 'keep_all',
        },
        {
          name: 'Overwrite',
          value: 'overwrite',
        },
        {
          name: 'Overwrite all',
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
 * This function is called when we are trying to copy a file that already exists
 * at the destination. In that case we provide the user various options for what
 * to do.
 */
function processFile(sourcePath, targetPath, sourceFileContent, options) {
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

    if (!options.confirm && !options.overwriteAll) {
      return Promise.resolve({write: false, keepAll: true});
    }
    if (options.overwriteAll) {
      return Promise.resolve({write: true, overwriteAll: true});
    }

    if (!options.ignoreHash) {
      // Lets see whether the existing file is based on the current version.
      // This avoids asking the user if the source file didn't change but they
      // made custom changes to it.
      if (!needsUpdate(targetFileContent, sourceFileContent)) {
        return Promise.resolve({write: false});
      }
      // If it needs updating, do that automatically if the target file wasn't
      // changed manually
      if (!wasModified(targetFileContent)) {
        return Promise.resolve({write: true});
      }
    }

    return ask(relativePath).then(function handleAnswer(answer) {
      switch (answer.action) {
        case 'overwrite_all':
          overwriteAll = true;
        case 'overwrite': // eslint-disable-line no-fallthrough
          return {write: true, overwriteAll};
        case 'diff':
          diff.printDiff(
            targetPath,
            targetFileContent,
            sourcePath,
            sourceFileContent
          );
          return inquirer.prompt([{
              type: 'input',
              message: '(press return to continue)',
              name: 'continue',
            }])
            .then(() => ask(relativePath))
            .then(handleAnswer);
        case 'edit':
          return inquirer.prompt([{
              type: 'input',
              message:
                "Replace '-' with ' ' (space) for lines you want to keep.\n" +
                "Remove lines with '+' that you don't want to add.\n" +
                '(press return to continue)',
              name: 'info',
            }])
            .then(() => diff.editDiff(
              path.extname(targetPath),
              targetFileContent,
              sourceFileContent
            ))
            .then(
              contents => ({write: true, contents}),
              error => {
                log(colors.red(
                  `\nSkipping file, got error: ${error.message || error}`
                ));
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

// Hash the file and compare against the hash stored in the file. If it differs,
// the file was manually edited.
function wasModified(content) {
  const match = content.match(HASH_PATTERN);
  // If we cannot find the pattern it was manually removed (hence edited) or
  // created before we hashed files
  if (!match) {
    return true;
  }
  const storedHash = match[1];
  // Strip hash from the file
  return storedHash !== hash(content.replace(' ' + storedHash, ''));
}

// If the hash if the source file differs from the hash stored in the target
// file, the target file needs to be updated.
function needsUpdate(targetFileContent, sourceFileContent) {
  const match = targetFileContent.match(HASH_PATTERN);
  // If we cannot find the pattern it was manually removed (hence edited) or
  // created before we hashed files
  if (!match) {
    return true;
  }
  return match[1] !== sourceFileContent.match(HASH_PATTERN)[1];
}

function hash(content) {
  return crypto.createHash('md5')
    .update(content)
    .digest('hex');
}
