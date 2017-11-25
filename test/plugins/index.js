const webpack = require('@cypress/webpack-preprocessor');
const config = require('../../build/webpack.test.conf');
const options = {
  webpackOptions: config,
  watchOptions: {}
};

module.exports = (on) => {
  on('file:preprocessor', webpack(options));
};
