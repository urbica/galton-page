const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: './dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.js$/,
            include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
            loader: 'transform/cacheable?brfs'
      }
    ],
    postLoaders: [{
            include: /node_modules\/mapbox-gl-shaders/,
            loader: 'transform',
            query: 'brfs'
    }]
  }
};