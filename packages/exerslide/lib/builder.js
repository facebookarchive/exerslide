/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const EventEmitter = require('events');
const WebpackDevServer = require('webpack-dev-server');
const copyGlobs = require('./fs/copyGlobs');
const colors = require('colors');
const fs = require('fs');
const globby = require('globby');
const indent = require('./utils/indent');
const initPlugins = require('./initPlugins');
const initTransforms = require('./initTransforms');
const opener = require('opener');
const path = require('path');
const resolve = require('resolve');
const sane = require('sane');
const temp = require('temp').track();
const webpack = require('webpack');

/**
 * The Builder class kicks off all the different ways of building the
 * presentation (build, watch, serve) and emits events about the current status.
 */
class Builder extends EventEmitter {
  _getLogger() {
    return {
      start: (task, message) => {
        this.emit('start', {task, message});
      },
      stop: (task, message) => {
        this.emit('stop', {task, message});
      },
      info: (task, message) => {
        this.emit('info', {task, message});
      },
      error: (task, message) => {
        this.emit('error', {task, message});
      },
      warn: (task, message) => {
        this.emit('warning', {task, message});
      },
      clear: () => {
        this.emit('clear');
      },
    };
  }

  _getConfigs(env) {
    const exerslideConfig = env.config;
    const webpackConfig = require(
      path.join(env.configBase, './webpack.config.js')
    );
    webpackConfig.context = webpackConfig.context || env.configBase;

    return {exerslideConfig, webpackConfig};
  }

  _prepare(exerslideConfig, webpackConfig, logger) {
    initSlideFile(exerslideConfig, webpackConfig);
    initPlugins(exerslideConfig, webpackConfig);
    initTransforms(exerslideConfig, webpackConfig);

    const relativeOutPath = getRelativeOutDirectory(
      exerslideConfig,
      webpackConfig
    );
    logger.info(
      '',
      `Generating presentation into ${colors.cyan(relativeOutPath)} ...\n`
    );
  }

  build(env, options) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();

    // Generate slide files, load plugins and transforms
    this._prepare(configs.exerslideConfig, configs.webpackConfig, logger);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      bundle(configs.exerslideConfig, configs.webpackConfig, logger, options),
    ]);
  }

  watch(env, options) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();
    logger.clear();

    configs.webpackConfig.watch = true;
    // Generate slide files, load plugins and transforms
    this._prepare(configs.exerslideConfig, configs.webpackConfig, logger);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      bundle(configs.exerslideConfig, configs.webpackConfig, logger, options),
      watchSlides(configs.exerslideConfig, configs.webpackConfig, logger),
    ]);
  }

  serve(env, options) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();
    logger.clear();

    // Generate slide files, load plugins and transforms
    this._prepare(configs.exerslideConfig, configs.webpackConfig, logger);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      serve(configs.exerslideConfig, configs.webpackConfig, logger, options),
      watchSlides(configs.exerslideConfig, configs.webpackConfig, logger),
    ]);
  }
}

module.exports = new Builder();

/**
 * This function finds all slides matching the provided pattern(s) and updates
 * the generated slide file accordingly. This function is also called from the
 * file watcher when any of the slide files changed (added, removed, updated).
 */
function writeSlideFile(config) {
  let slides = globby.sync(config.slidePaths);
  if (config.processSlides) {
    slides = config.processSlides(slides);
  }
  fs.writeFileSync(
    config.__slideFile__,
    'module.exports = [\n' +
      slides
        .map(p => (
          'require("' + path.join(__dirname, './slide-loader') +
          '!' + path.relative(path.dirname(config.__slideFile__), p) +
          '")'
        ))
        .join(',\n') +
    '];'
  );
}

function initSlideFile(exerslideConfig, webpackConfig) {
  // Having generated files in the project folder makes dependency resolution
  // easier
  const tmpDir = temp.mkdirSync({dir: webpackConfig.context});
  exerslideConfig.__slideFile__ = path.join(tmpDir, 'slides.js');

  process.on('SIGINT', function() {
    temp.cleanupSync();
    process.abort();
  });
  writeSlideFile(exerslideConfig);

  // Injecting slides global variable
  if (!webpackConfig.plugins) {
    webpackConfig.plugins = [];
  }
  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
      __exerslide_slides__: exerslideConfig.__slideFile__,
    })
  );
}

/**
 * Copies all files matching the patterns specified in exerslide.config.js.
 * Those are usually not handled by webpack.
 */
function copyStatics(exerslideConfig, webpackConfig, logger) {
  const id = 'copy statics';
  const relativeOutPath = getRelativeOutDirectory(
    exerslideConfig,
    webpackConfig
  );
  logger.start(
    id,
    `Copying files into ${colors.cyan(relativeOutPath)} ...`
  );
  return copyGlobs(
    exerslideConfig.assets,
    exerslideConfig.out,
    webpackConfig.context
  )
  .then(
    () => logger.stop(id, 'Done copying files.'),
    error => logger.error(id, error)
  );

}

/**
 * Start webpack to bundle and copy all JavaScript, CSS and other files.
 */
function bundle(exerslideConfig, webpackConfig, logger, options) {
  const id = 'bundler';

  logger.start(id, 'Generating presentation...');
  return new Promise(resolve => {
    const compiler = webpack(webpackConfig, function(err, stats) {
      if (err) {
        logger.error(id, colors.red('Presentation generation failed!'));
        logger.error(id, err);
        return;
      }
      if (options.verbose) {
        logger.info(id, stats.toString());
        return;
      }

      if (stats.hasErrors() || stats.hasWarnings()) {
        logWebpackErrors(id, webpackConfig, stats, logger);
        return;
      }
      if (!webpackConfig.watch) {
        logger.stop(
          id,
          colors.green('Presentation successfully created!')
        );
        resolve();
      } else {
        logger.info(id, colors.green('Presentation successfully updated!'));
      }
    });
    if (webpackConfig.watch) {
      compiler.compiler.plugin('invalid', () => {
        logger.clear();
        logger.info(id, 'Change detected, updating presentation...');
      });
    }
  });
}

/**
 * Adjust entry file specifications to work with webpack-dev-server.
 */
function patchEntry(config, port) {
  const webpackDevServerPath = resolve.sync(
    'webpack-dev-server/client',
    {basedir: __dirname}
  );
  const newEntry = webpackDevServerPath + `?http://localhost:${port}`;

  function patch(entry) {
    if (typeof entry === 'string') {
      return [newEntry, entry];
    } else if (Array.isArray(entry)) {
      entry.unshift(newEntry);
      return entry;
    } else if (typeof entry === 'object') {
      for (var prop in entry) {
        entry[prop] = patch(entry[prop]);
      }
      return entry;
    }
  }
  patch(config.entry);
}

/**
 * Starts webpack-dev-server and opens the default browser.
 */
function serve(exerslideConfig, webpackConfig, logger, options) {
  const id = 'devserver';

  logger.start(id, 'Starting server and generating presentation...');
  return new Promise(() => {
    patchEntry(webpackConfig, options.port);
    const compiler = webpack(webpackConfig);

    // verbose means we show webpack's raw output. Otherwise we should a more
    // friendly output
    if (!options.verbose) {
      compiler.plugin('invalid', () => {
        logger.clear();
        logger.info(id, 'Change detected, updating presentation...');
      });

      compiler.plugin('done', stats => {
        if (stats.hasErrors() || stats.hasWarnings()) {
          logWebpackErrors(id, webpackConfig, stats, logger);
          return;
        }

        logger.info(id, colors.green('Presentation succesfully updated.'));
        logger.info(
          id,
          'The presentation is running at\n\n' +
          `  ${colors.cyan(`http://localhost:${options.port}/`)} \n\n` +
          'To create a production version, run "exerslide build".'
        );
      });
    }

    const server = new WebpackDevServer(compiler, {
      // Serve static files from here
      contentBase: exerslideConfig.out,
      publicPath: webpackConfig.output.publicPath,
      quiet: !options.verbose,
      watchOptions: {
        // Don't watch node_modules files, except exerslide packages.
        // That makes local development of exerslide easier.
        ignored: /node_modules\/(?!exerslide)/,
      },
    });
    server.listen(options.port, function() {
      if (options.openBrowser) {
        opener(`http://localhost:${options.port}`);
      }
    });
  });
}

/**
 * Watches the slide patterns specified in exerslide.config.js for changes.
 *
 * Since we autogenerate the file that references all the slides, new slides
 * are not automatically picked up by webpack. We have to regenerate the slides
 * file first.
 *
 * We also have to regenerate the slides file when a slide is deleted. Otherwise
 * webpack will error that it cannot find the file.
 */
function watchSlides(exerslideConfig, webpackConfig, logger) {
  const id = 'slide watcher';

  logger.start(id, 'Watching slides for changes...');
  return new Promise(() => {
    const watcher = sane(
      webpackConfig.context,
      {glob: exerslideConfig.slidePaths.map(
          p => p.replace(/^\.\//, '') // strip ./ prefix
      )}
    );
    watcher.on('add', () => writeSlideFile(exerslideConfig));
    watcher.on('delete', () => writeSlideFile(exerslideConfig));
  });
}

function logWebpackErrors(id, webpackConfig, stats, logger) {
  if (stats.hasErrors()) {
    logger.error(
      id,
      colors.red('Presentation generation failed!\nList of errors:')
    );
    stats.compilation.errors.forEach(
      error => logger.error(id, formatWebpackError(error, webpackConfig))
    );
    return;
  }

  if (stats.hasWarnings()) {
    logger.warn(
      id,
      colors.yellow('Presentation generated with warnings!')
    );
    logger.warn(
      id,
      colors.yellow('List of warnings:')
    );
    stats.compilation.warnings.forEach(
      error => logger.warn(id, formatWebpackError(error, webpackConfig))
    );
    return;
  }
}

function formatWebpackError(error, webpackConfig) {
  const message = cleanWebpackErrorMessage(error.message || error);
  if (!error.module) {
    return message + '\n';
  }
  const relativePath = path.relative(
    webpackConfig.context,
    error.module.resource
  );

  return `\nIn file ${colors.cyan(`"${relativePath}"`)}:\n` +
    indent(message, '  ');
}

function cleanWebpackErrorMessage(message) {
  return message
    .replace(/^Error: Child compilation failed:\s*(.+?)in \//, '$1')
    .replace(/^Module build failed: /, '')
    .replace(
      /^Module not found: Error: (Cannot resolve module '[^']+').*$/,
      '$1'
    );
}

function getRelativeOutDirectory(exerslideConfig, webpackConfig) {
  return path.relative(
    webpackConfig.context,
    exerslideConfig.out
  );
}
