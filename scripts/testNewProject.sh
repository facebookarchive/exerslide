#!/bin/bash
# Copyright (c) 2016-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

set -e

# Simulate installing global exerslide
pushd packages/exerslide-cli
npm link
popd


# Create empty project folder
mkdir testProject
dir=$(pwd)
trap 'cd "$dir" && rm -rf testProject' ERR EXIT
pushd testProject

# Link exerslide (simulates the first step of exerslide init)
mkdir node_modules
npm link ../packages/exerslide/

# Initialize and build
# This will install dependencies from
exerslide init --confirm=false
exerslide build
