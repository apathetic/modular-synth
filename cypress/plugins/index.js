const wp = require('@cypress/webpack-preprocessor')

module.exports = (on) => {
  const options = {
    webpackOptions: require('../../build/webpack.base.conf');
  }
  on('file:preprocessor', wp(options))
}