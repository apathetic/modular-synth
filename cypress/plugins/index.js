const webpack = require('@cypress/webpack-preprocessor');
const config = require('../../build/webpack.dev.conf');
const options = { webpackOptions: config };

module.exports = (on) => {
  on('file:preprocessor', webpack(options));
}