/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const exerslide = require('exerslide');
const exerslideConfig = require('./exerslide.config');
const path = require('path');
const webpack = require('webpack');

const PROD = process.env.NODE_ENV === 'production';

const plugins = [
  new webpack.DefinePlugin({
    '__DEV__': !PROD,
    'process.env.NODE_ENV':
    JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
  new ExtractTextPlugin('[name].css'),
];

if (PROD) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: false,
    compress: {
      warnings: false,
    },
  }));
}

module.exports = {
  entry: {
    app: './js/presentation.js',
    style: exerslideConfig.stylesheets.map(function(sheetPath) {
      return sheetPath[0] === '.' ? path.join(__dirname, sheetPath) : sheetPath;
    }),
  },
  output: {
    path: exerslideConfig.out,
    filename: '[name].js',
    pathinfo: !PROD,
  },
  debug: !PROD,
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules\/(?!exerslide\b)/,
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react'),
            require.resolve('babel-preset-stage-0'),
          ],
          plugins: [
            require.resolve('babel-plugin-transform-runtime'),
          ],
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css?importLoaders=1!autoprefixer?{"browsers": "> 1%"}'
        ),
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'file-loader?name=[name]-[sha512:hash:base64:7].[ext]',
      },
      // This is required for font-awesome's font files
      {
        test: /\.(svg|ttf|woff2?|eot)(\?.*)?$/,
        loader: 'file-loader?name=[name]-[sha512:hash:base64:7].[ext]',
      },
    ],
  },
  plugins: plugins,
  slideLoader: {
    transforms: [
      /**
       * This finds paths to assets in slides so that they can be processed by
       * webpack. This allows you to reference assets in slides (e.g. displaying
       * an image) without having to explicitly copy them.
       *
       * You might want to adjust this depending on the content of your
       * slides. If you don't want to auto-copy them at all, remove this
       * transform.
       */
      exerslide.transforms.requireAssets({
        // pattern: /(?:\.{1,2}\/)+[-_\/a-z\d.]+\.(?:png|jpe?g|gif|svg)\b/ig,
      }),
    ],
  },
};
