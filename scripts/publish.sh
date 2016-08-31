#!/bin/sh
# Copyright (c) 2016-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant 
# of patent rights can be found in the PATENTS file in the same directory.

source ./scripts/shared.sh

for pkg in $PACKAGES; do
  pushd "$PACKAGESPATH/$pkg" > /dev/null

  if ! npm publish ; then
    echo "Failed to publish $pkg"
  fi

  popd > /dev/null
done
