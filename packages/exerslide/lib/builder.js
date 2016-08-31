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
const fs = require('fs');
const globby = require('globby');
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
      start: task => {
        this.emit('start', {task});
      },
      stop: task => {
        this.emit('stop', {task});
      },
      info: (task, message) => {
        this.emit('info', {task, message});
      },
      error: (task, error) => {
        this.emit('error', {task, error});
      },
      warn: (task, warning) => {
        this.emit('warning', {task, warning});
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

  _prepare(exerslideConfig, webpackConfig) {
    initSlideFile(exerslideConfig, webpackConfig);
    initPlugins(exerslideConfig, webpackConfig);
    initTransforms(exerslideConfig, webpackConfig);
  }

  build(env) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();

    this._prepare(configs.exerslideConfig, configs.webpackConfig);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      bundle(configs.exerslideConfig, configs.webpackConfig, logger),
    ]);
  }

  watch(env) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();

    configs.webpackConfig.watch = true;
    this._prepare(configs.exerslideConfig, configs.webpackConfig);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      bundle(configs.exerslideConfig, configs.webpackConfig, logger),
      watchSlides(configs.exerslideConfig, configs.webpackConfig, logger),
    ]);
  }

  serve(env, port) {
    const configs = this._getConfigs(env);
    const logger = this._getLogger();

    this._prepare(configs.exerslideConfig, configs.webpackConfig);

    return Promise.all([
      copyStatics(configs.exerslideConfig, configs.webpackConfig, logger),
      serve(port, configs.exerslideConfig, configs.webpackConfig, logger),
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
  logger.start(id);
  return copyGlobs(
    exerslideConfig.assets,
    exerslideConfig.out,
    webpackConfig.context
  )
  .then(
    () => logger.stop(id),
    error => logger.error(id, error)
  );

}

/**
 * Start webpack to bundle and copy all JavaScript, CSS and other files.
 */
function bundle(exerslideConfig, webpackConfig, logger) {
  const id = 'bundler';

  logger.start(id);
  return new Promise(resolve => {
    webpack(webpackConfig, function(err, stats) {
      if (err) {
        logger.error(id, err);
        return;
      }
      if (stats.hasErrors()) {
        stats.compilation.errors.forEach(error => {
          const relativePath = path.relative(
            webpackConfig.context,
            error.module.resource
          );
          logger.error(id, `In file "${relativePath}":\n${error.message}\n`);
        });
      }
      if (stats.hasWarnings()) {
        stats.compilation.warnings.forEach(warning => {
          const relativePath = path.relative(
            webpackConfig.context,
            warning.module.resource
          );
          logger.warn(id, `In file "${relativePath}":\n${warning.message}\n`);
        });
      }
      if (!webpackConfig.watch) {
        logger.stop(id);
        resolve();
      } else {
        logger.info(id, 'updated...');
      }
    });
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
function serve(port, exerslideConfig, webpackConfig, logger) {
  const id = 'devserver';

  logger.start(id);
  return new Promise(() => {
    patchEntry(webpackConfig, port);
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, {
      contentBase: exerslideConfig.out,
    });
    server.listen(port, function() {
      opener(`http://localhost:${port}`);
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

  logger.start(id);
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
