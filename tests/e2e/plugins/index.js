const webpack = require('@cypress/webpack-preprocessor');
const path = require('path');

// const webpackOptions = require('../../build/webpack.test.conf');
// const webpackOptions = require('../../build/webpack.base.conf');
// webpackOptions.resolve.alias: {
//   '@': resolve('src')
// }

const webpackOptions = {
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': resolve('src')
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};

const options = {
  webpackOptions: webpackOptions,
  watchOptions: {}
};



function resolve (dir) {
  return path.join(__dirname, '../..', dir) // NOTE: we're 2 levels deep here
}

module.exports = (on) => {
  on('file:preprocessor', webpack(options));
};
