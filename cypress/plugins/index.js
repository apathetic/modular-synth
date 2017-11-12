const wp = require('@cypress/webpack-preprocessor')

module.exports = (on) => {
  const options = {
    webpackOptions: require('../../build/webpack.test.conf');
  }
  on('file:preprocessor', wp(options))
}