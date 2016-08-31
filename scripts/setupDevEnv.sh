#!/bin/sh
# Copyright (c) 2016-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant 
# of patent rights can be found in the PATENTS file in the same directory.

set -e

# A helper script to setup an example presentation in the provided (or a 
# default path). It will link all packages and dependencies.

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
TARGETPATH="$1"
PACKAGESPATH="$SCRIPTPATH/../packages"

if [ -z "$TARGETPATH" ]; then
  TARGETPATH="test/"
fi

if [ ! -d "$TARGETPATH" ]; then
  mkdir -p "$TARGETPATH"
fi

has_package() {
  if [ -e "$PACKAGESPATH/$1/package.json" ]; then
    return 0;
  fi
  return 1;
}

peer_dependencies() {
  PEER_DEPENDENCIES=''
  if has_package "$pkg"; then
    PEER_DEPENDENCIES=$(cat "$PACKAGESPATH/$pkg/package.json" | node -e "process.stdout.write(Object.keys(JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).peerDependencies || {}).join(' '));")
  fi
}

PACKAGES=$(
  for pkg in $(ls "$PACKAGESPATH"); do
    if has_package "$pkg"; then
      echo "$pkg"
    fi
  done
);

ALL_PEER_DEPENDENCIES=''
for pkg in $PACKAGES; do
  peer_dependencies $pkg
  ALL_PEER_DEPENDENCIES="$ALL_PEER_DEPENDENCIES $PEER_DEPENDENCIES"
done

# 0. Install peer dependencies globally
echo "0. Install all peer dependencies globally"

INSTALL_PEER_DEPENDENCIES=''
for dep in $ALL_PEER_DEPENDENCIES; do
  if [[ ! $PACKAGES =~ $dep && ! $INSTALL_PEER_DEPENDENCIES =~ $dep ]]; then
    INSTALL_PEER_DEPENDENCIES="$INSTALL_PEER_DEPENDENCIES $dep"
  fi
done
npm rm -g $INSTALL_PEER_DEPENDENCIES
npm install -g $INSTALL_PEER_DEPENDENCIES

# 1. "npm link" all packages
echo "1. Link all packages"
for pkg in $PACKAGES; do
  echo "  Linking $pkg"
  cd "$PACKAGESPATH/$pkg"
  npm link
  cd - > /dev/null
done

# 2. Init example project
echo "2. Initializing test project ..."
cd "$TARGETPATH";
# We cannot run exerslide init since it would try to install exerslide from npm
# Instead we link it manually
mkdir -p node_modules
npm link "$PACKAGESPATH/exerslide/"
exerslide copy-defaults

# 3. Remove "exerslide" from the dependecies
echo "3. Fix dependencies..."
PKG=`cat package.json`
echo "$PKG" | grep -v '"exerslide.*": "' > package.json

# 4. Install dependencies
echo "4. Installing dependencies..."
npm install

# 5. Restore package.json
echo "5. Restore package.json..."
echo "$PKG" > package.json

# 6. Link packages
echo "6. Linking packages"
for pkg in $PACKAGES; do
  echo "  Linking $pkg..."
  npm link "$pkg"
done

# 7. Linking peer dependencies
echo "7. Link peer dependencies..."

# In example project
for dep in $INSTALL_PEER_DEPENDENCIES; do
  echo "  Linking $dep..."
  npm link "$dep"
done

# In each package
for pkg in $PACKAGES; do
  echo "  Linking peer dependencies of $pkg"
  cd "$PACKAGESPATH/$pkg"
  peer_dependencies "$pkg"
  for dep in $PEER_DEPENDENCIES; do
    npm link "$dep"
  done
  cd - > /dev/null
done

echo "done!"
