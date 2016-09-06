/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

/**
 * Recursively copies all files inside a directory to a target directory. If the
 * file already exists at the target location, `ask` is called.
 *
 * `ask` has to return a promise that resolves to an object with four
 * properties:
 *   - write: Copy the file
 *   - overwriteAll: Overwrite all future files (don't ask anymore)
 *   - keepAll: Keep all future files (don't ask anymore)
 *   - contents: Optionally the contents of the file to write
 *
 * Note: This function isn't really supposed to be reused. It's used for the
 * scaffolding process, but I moved it into its own file because it is a lot of
 * code.
 *
 * @param {Object} options
 *  - sourceDir: Path to source directory
 *  - targetDir: Path to target directory
 *  - ignorePatterns: An array of regular expressions. If a pattern matches for
 *    a path, the path is skipped.
 *  - transform: A function to optionally convert file contents before copying
 *  - ask: A function that is called when a file already exists at the target
 *    location.
 *
 * @return EventEmitter An event emitter that can be listend to for copy, skip,
 *   finish and error events.
 */
module.exports = function copyDir(options) {
  const ignorePatterns = options.ignorePatterns || [];
  const renameMap = options.renameMap || {};
  const transform = options.transform;
  const ask = options.ask;

  const emitter = new EventEmitter();
  const emitError = error => emitter.emit('error', error);

  let keepAll = false;
  let overwriteAll = false;

  function copyDirImplementation(sourceDir, targetDir, done) {
    fs.readdir(sourceDir, (error, files) => {
      if (error) {
        emitError(error);
        return;
      }

      function next() {
        if (files.length > 0) {
          const file = files.pop();
          const sourcePath = path.join(sourceDir, file);
          const relativeSourcePath = path.relative(
            options.sourceDir,
            sourcePath
          );
          const targetPath = path.join(
            targetDir,
            renameMap[relativeSourcePath] || file
          );

          if (ignorePatterns.some(p => p.test(sourcePath))) {
            next();
            return;
          }

          // Collect info about source path
          fs.stat(sourcePath, (error, sourceStats) => {
            if (error) {
              emitError(error);
              return;
            }

            // Collect info about target path
            fs.stat(targetPath, error => {
              let exists = true;
              if (error) {
                if (error.code === 'ENOENT') {
                  exists = false;
                } else {
                  emitError(error);
                  return;
                }
              }

              if (sourceStats.isDirectory()) {
                fs.mkdir(targetPath, sourceStats.mode, error => {
                  if (error && error.code !== 'EEXIST') {
                    emitError(error);
                    return;
                  } else {
                    copyDirImplementation(sourcePath, targetPath, next);
                  }
                });
              } else if (!exists || overwriteAll) {
                delegateEvents(copyFile({
                  sourcePath,
                  targetPath,
                  mode: sourceStats.mode,
                  transform,
                }));
              } else {
                let sourceContents;
                try {
                  sourceContents = fs.readFileSync(sourcePath);
                } catch (error) {
                  emitError(error);
                  return;
                }
                if (transform) {
                  sourceContents = transform(
                    sourcePath,
                    targetPath,
                    sourceContents
                  );
                }
                if (!keepAll) {
                  // ask the user what to do
                  ask(sourcePath, targetPath, sourceContents).then(
                    (options) => {
                      overwriteAll = options.overwriteAll;
                      keepAll = options.keepAll;
                      const contents = options.contents || sourceContents;
                      if (options.write) {
                        delegateEvents(copyFile({
                          sourcePath,
                          targetPath,
                          mode: sourceStats.mode,
                          contents,
                        }));
                      } else {
                        markFileAsUpdated(
                          sourceContents,
                          sourcePath,
                          targetPath
                        );
                      }
                    },
                    emitError
                  );
                } else {
                  markFileAsUpdated(
                    sourceContents,
                    sourcePath,
                    targetPath
                  );
                }
              }
            });
          });
        } else {
          done();
        }
      }

      function delegateEvents(otherEmitter) {
        otherEmitter.on('copy', emitter.emit.bind(emitter, 'copy'));
        otherEmitter.on('skip', emitter.emit.bind(emitter, 'skip'));
        otherEmitter.once('error', emitter.emit.bind(emitter, 'error'));
        otherEmitter.once('finish', next);
      }

      function markFileAsUpdated(sourceContents, sourcePath, targetPath) {
        if (!/@exerslide-file-hash/.test(sourceContents)) {
          emitter.emit('skip', sourcePath);
          return next();
        }
        try {
          const targetContents = fs.readFileSync(targetPath).toString();
          // If there is no hash in target file we cannot update it
          if (!/@exerslide-file-hash/.test(targetContents)) {
            emitter.emit('skip', sourcePath);
            return next();
          }
          // We still have to update the hash in the file so that
          // we know we already asked the user about this file
          const updated = updateHash(sourceContents, targetPath);
          if (updated) {
            emitter.emit('update-hash', sourcePath);
          } else {
            emitter.emit('skip', sourcePath);
          }
        } catch (error) {
          emitter.emit('error', error);
        }
        next();
      }

      // start
      next();
    });
  }

  copyDirImplementation(
    options.sourceDir,
    options.targetDir,
    () => emitter.emit('finish')
  );

  return emitter;
}

/**
 * Copies a file to another path, optionally converting its contents via
 * `transform`.
 *
 * @param {Object} options
 *  - sourcePath: string
 *  - targetPath: string
 *  - mode: number
 *  - transform: function
 *  - contents: Buffer | string
 */
function copyFile(options) {
  const sourcePath = options.sourcePath;
  const targetPath = options.targetPath;
  const mode = options.mode;
  const transform = options.transform;
  let contents = options.contents;

  const emitter = new EventEmitter();

  if (!transform && !contents) {
      const rs = fs.createReadStream(sourcePath);
      const ws = fs.createWriteStream(targetPath, {mode});
      rs.on('error', emitter.emit.bind(emitter, 'error'));
      ws.on('error', emitter.emit.bind(emitter, 'error'));
      ws.on('finish', () => {
        emitter.emit('copy', sourcePath, targetPath);
        emitter.emit('finish');
      });
      rs.pipe(ws);
  } else {
    try {
      contents = contents == null ? fs.readFileSync(sourcePath) : contents;
    } catch (error) {
      emitter.emit('error', error);
      return;
    }
    if (transform) {
      contents = transform(sourcePath, targetPath, contents);
    }
    fs.writeFile(targetPath, contents, {mode}, (error) => {
      if (error) {
        emitter.emit('error', error);
      } else {
        emitter.emit('copy', sourcePath, targetPath);
        emitter.emit('finish');
      }
    });
  }

  return emitter;
}

function updateHash(sourceContents, targetPath) {
  // We still have to update the hash in the file so that
  // we know we already asked the user about this file
  const sourceHash = sourceContents.match(
    /@exerslide-file-hash (\S+)/
  )[1];
  const targetContents =
    fs.readFileSync(targetPath).toString();
  const targetHash = targetContents.match(
    /@exerslide-file-hash (\S+)/
  )[1];
  if (targetHash !== sourceHash) {
    fs.writeFileSync(
      targetPath,
      fs.readFileSync(targetPath).toString()
        .replace(
          /@exerslide-file-hash \S+/,
          '@exerslide-file-hash ' + sourceHash
        )
    );
    return true;
  } else {
    return false;
  }
}
