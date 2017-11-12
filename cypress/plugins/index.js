const webpack = require('@cypress/webpack-preprocessor')
const options = {
  webpackOptions: require('../../build/webpack.base.conf');
};

module.exports = (on) => {
  on('file:preprocessor', webpack(options))
}