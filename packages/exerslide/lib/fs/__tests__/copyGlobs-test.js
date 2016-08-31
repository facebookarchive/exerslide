/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const copyStatics = require('../copyGlobs');
const testUtils = require('../../../scripts/test-utils');

describe('copyGlobs', () => {

  it('copies files matching the patterns', () => {
    const dir = testUtils.makeDirectoryStructure({
      dir1: {
        file1: 'file1',
        dir2: {
          file2: 'file2',
        },
      },
      dir3: {
        file3: 'file3',
      },
    });

    return copyStatics(['dir1/**/*', 'dir3/*'], 'out/', dir).then(() => {
      testUtils.validateFolderStructure(
        dir,
        {
          out: {
            file1: 'file1',
            dir2: {
              file2: 'file2',
            },
            file3: 'file3',
          },
        }
      );
    });
  });

  if (process.env.TMPDIR) {
    it('copies files to absolute out dir', () => {
      const dir = testUtils.makeDirectoryStructure({
        dir1: {
          file1: 'file1',
          dir2: {
            file2: 'file2',
          },
        },
        dir3: {
          file3: 'file3',
        },
      });

      const out = process.env.TMPDIR + '/exerslide-test/out/';

      return copyStatics(['dir1/**/*', 'dir3/*'], out, dir).then(() => {
        testUtils.validateFolderStructure(
          out,
          {
            file1: 'file1',
            dir2: {
              file2: 'file2',
            },
            file3: 'file3',
          }
        );
      });

    });
  }

});

