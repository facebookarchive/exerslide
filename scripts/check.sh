#!/bin/bash
# Copyright (c) 2016-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant 
# of patent rights can be found in the PATENTS file in the same directory.

set -e

source ./scripts/shared.sh

for pkg in $PACKAGES; do
  pushd "$PACKAGESPATH/$pkg" > /dev/null

  if grep -q '"lint":' ./package.json; then
    npm run lint
  fi

  if grep -q '"test":' ./package.json; then
    npm test
  else
    echo "Skipping '$pkg' because it doesn't have any tests"
  fi

  popd > /dev/null
done

# Build example as smoke test
pushd ./example
echo "exerslide build"
exerslide build 
echo "exerslide watch"
exerslide watch --smoke-test
echo "exerslide serve"
exerslide serve --no-open-browser --smoke-test
