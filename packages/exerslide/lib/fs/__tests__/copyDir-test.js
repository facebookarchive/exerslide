/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const expect = require('chai').expect;
const copyDir = require('../copyDir');
const testUtils = require('../../../scripts/test-utils');
const path = require('path');

describe('copyDir', () => {

  it('copies one directory to another', done => {
    const dir = testUtils.makeDirectoryStructure({
      source: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      target: {},
    });

    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {},
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        {
          file1: 'file1',
          dir2: {
            file2: 'file2',
          },
        }
      );
      done();
    });
  });

  it('asks when a file already exists with different content and overwrites it', done => {
    const dirs = {
      source: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      target: {
        file1: 'file1changed',
      },
    };
    const dir = testUtils.makeDirectoryStructure(dirs);

    let asked = false;
    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {
        asked = true;
        return Promise.resolve({write: true});
      },
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        dirs.source
      );
      expect(asked).to.be.true;
      done();
    });
  });

  it('asks when a file already exists with different content and preserves it', done => {
    const dir = testUtils.makeDirectoryStructure({
      source: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      target: {
        file1: 'file1changed',
      },
    });

    let asked = false;
    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {
        asked = true;
        return Promise.resolve({write: false});
      },
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        {
          file1: 'file1changed', // preserved
          dir2: {
            file2: 'file2',
          },
        }
      );
      expect(asked).to.be.true;
      done();
    });
  });

  it('keeps all files when instructed but still copies new ones', done => {
    const dir = testUtils.makeDirectoryStructure({
      source: {
        file1: 'file1',
        file3: 'file3',
        dir2: {
          file2: 'file2',
        },
        file4: 'file4',
      },
      target: {
        file1: 'file1changed',
        dir2: {
          file2: 'file2changed',
        },
        file4: 'file4changed',
      },
    });

    let asked = 0;
    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {
        asked++;
        return Promise.resolve({write: false, keepAll: true});
      },
    });

    emitter.once('finish', () => {
      try {
        testUtils.validateFolderStructure(
          path.join(dir, '/target'),
          {
            file1: 'file1changed', // preserved
            file3: 'file3', // new
            dir2: {
              file2: 'file2changed', // preserved
            },
            file4: 'file4changed', // preserved
          }
        );
        expect(asked).to.equal(1);
      } catch (err) {
        done(err);
        return;
      }
      done();
    });
  });

  it('doesn\'t ask again if keepAll was answered for subdirectory', done => {
    const dir = testUtils.makeDirectoryStructure({
      source: {
        dir1: {
          file1: 'file1',
        },
        dir2: {
          file2: 'file2',
        },
      },
      target: {
        dir1: {
          file1: 'file1changed',
        },
        dir2: {
          file2: 'file2changed',
        },
      },
    });

    let asked = 0;
    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {
        asked++;
        return Promise.resolve({write: false, keepAll: true});
      },
    });

    emitter.once('finish', () => {
      try {
        testUtils.validateFolderStructure(
          path.join(dir, '/target'),
          {
            dir1: {
              file1: 'file1changed', // preserved
            },
            dir2: {
              file2: 'file2changed', // preserved
            },
          }
        );
        expect(asked).to.equal(1);
      } catch (err) {
        done(err);
        return;
      }
      done();
    });
  });

  it('overwrites all files when instructed', done => {
    const dirs = {
      source: {
        file1: 'file1',
        file3: 'file3',
        dir2: {
          file2: 'file2',
        },
      },
      target: {
        file1: 'file1changed',
        dir2: {
          file2: 'file2changed',
        },
      },
    };
    const dir = testUtils.makeDirectoryStructure(dirs);

    let asked = 0;
    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      ask: () => {
        asked++;
        return Promise.resolve({write: false, keepAll: true});
      },
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        dirs.target
      );
      expect(asked).to.equal(1);
      done();
    });
  });

  it('passes files through a transformer', done => {
    const dirs = {
      source: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      target: {},
    };
    const dir = testUtils.makeDirectoryStructure(dirs);

    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      transform: (sp, tp, c) => c.toString().replace('file', 'foo'),
      ask: () => {},
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        {
          file1: 'foo1',
          dir2: {
            file2: 'foo2',
          },
        }
      );
      done();
    });
  });

  it('uses contents returned by the ask function', done => {
    const dirs = {
      source: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      target: {
        file1: 'file1changed',
      },
    };
    const dir = testUtils.makeDirectoryStructure(dirs);
    let askedContents;

    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      transform: (sp, tp, c) => c.toString().replace('file', 'foo'),
      ask: (sp, tp, c) => {
        askedContents = c;
        return Promise.resolve({write: true, contents: 'file1changedagain'});
      },
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        {
          file1: 'file1changedagain',
          dir2: {
            file2: 'foo2',
          },
        }
      );
      expect(askedContents).to.equal('foo1');
      done();
    });
  });

  it('renames files', done => {
    const dirs = {
      source: {
        file1: 'file1',
        dir2: {
          file1: 'file1',
        },
      },
      target: {},
    };
    const dir = testUtils.makeDirectoryStructure(dirs);

    const emitter = copyDir({
      sourceDir: path.join(dir, '/source'),
      targetDir: path.join(dir, '/target'),
      renameMap: {'dir2/file1': 'file2'},
    });

    emitter.once('finish', () => {
      testUtils.validateFolderStructure(
        path.join(dir, '/target'),
        {
          file1: 'file1',
          dir2: {
            file2: 'file1',
          },
        }
      );
      done();
    });
  });

});
