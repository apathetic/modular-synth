const webpack = require('@cypress/webpack-preprocessor');
const path = require('path');

// const webpackOptions = require('../../build/webpack.test.conf');
const webpackOptions = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.join(__dirname, '..', 'src')
    }
  }
};

const options = {
  webpackOptions: webpackOptions,
  watchOptions: {}
};

module.exports = (on) => {
  on('file:preprocessor', webpack(options));
};


