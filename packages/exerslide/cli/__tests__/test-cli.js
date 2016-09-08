#!/usr/bin/env node
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const yargs = require('yargs');

const cli = yargs
  .strict();

const commands = require('../');
Object.keys(commands).forEach(k => cli.command(commands[k]));

const _argv = cli.argv;
