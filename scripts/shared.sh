#!/bin/sh
# Copyright (c) 2016-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant 
# of patent rights can be found in the PATENTS file in the same directory.

set -e

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
PACKAGESPATH="$SCRIPTPATH/../packages"

has_package() {
  if [ -e "$PACKAGESPATH/$1/package.json" ]; then
    return 0;
  fi
  return 1;
}

PACKAGES=$(
  for pkg in $(ls "$PACKAGESPATH"); do
    if has_package "$pkg"; then
      echo "$pkg"
    fi
  done
);
