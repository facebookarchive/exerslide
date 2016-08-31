/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const temp = require('temp').track();
const expect = require('chai').expect;

/**
 * Helper function to create a directory structure described by the provided
 * object at root. If root is not provided, a new temporary directory is created
 * (and returned).
 *
 * Example:
 *
 * makeDirectoryStructure({
 *   x: {
 *     y: 'abc',
 *     z: 'def',
 *   },
 *   a: 'ghi'
 * }, './foo/bar');
 *
 * generates
 *
 *   - ./foo/bar/x/y with content 'abc'
 *   - ./foo/bar/x/z with content 'def'
 *   - ./foo/bar/a with content 'ghi'
 *
 *
 * @param {Object} structure
 * @param {?string] root Path to root directory
 * @return {string} Path to root directory
 */
exports.makeDirectoryStructure = function makeDirectoryStructure(dirs, root) {
  if (!root) {
    root = temp.mkdirSync();
  }
  var subdirs = Object.keys(dirs);
  if (subdirs.length === 0) {
    fs.ensureDirSync(root);
  } else {
    subdirs.forEach(name => {
      const p = path.join(root, name);
      switch (typeof dirs[name]) {
        case 'string':
          fs.outputFileSync(p, dirs[name]);
          break;
        case 'object':
          makeDirectoryStructure(dirs[name], p);
          break;
      }
    });
  }
  return root;
};

exports.validateFolderStructure = function validateFolderStructure(root, structure) {

  function normalize(p) {
    return p.replace(root, '');
  }

  function validateInternal(dir, structure) {
    for (var prop in structure) {
      const p = path.join(dir, prop);
      expect(() => fs.statSync(p), `${normalize(p)} exists`).to.not.throw();
      const stat = fs.statSync(p);
      if (typeof structure[prop] === 'object') {
        expect(stat.isDirectory())
          .to.equal(true, `${normalize(p)}) is directory`);
        validateFolderStructure(path.join(dir, prop), structure[prop]);
      } else {
        expect(stat.isFile()).to.equal(true, `${normalize(p)} is file`);
        if (structure[prop]) {
          switch (typeof structure[prop]) {
            case 'function':
              structure[prop](fs.readFileSync(p, 'utf-8'));
              break;
            case 'string':
              expect(fs.readFileSync(p, 'utf-8')).to.equal(structure[prop]);
              break;
          }
        }
      }
    }
  }

  validateInternal(root, structure);
};
