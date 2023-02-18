// https://docs.cypress.io/guides/guides/plugins-guide.html

// const VueLoaderPlugin = require('vue-loader/lib/plugin')
// const webpack = require('@cypress/webpack-preprocessor');
// const path = require('path');
// const webpackOptions = {
//   resolve: {
//     extensions: ['.js', '.vue', '.ts'],
//     alias: {
//       '@': path.join(__dirname, '../../src')
//     }
//   },

//   plugins: [
//     new VueLoaderPlugin()
//   ],

//   module: {
//     rules: [
//       {
//         test: /\.vue$/,
//         loader: 'vue-loader'
//       },
//       {
//         test: /\.ts$/,
//         exclude: [/node_modules/],
//         use: [
//           {
//             loader: 'ts-loader'
//           }
//         ]
//       },
//       {
//         test: /\.scss$/,
//         use: [
//           'vue-style-loader',
//           'css-loader',
//           'sass-loader'
//         ]
//       }
//     ]
//   }
// };

// const options = {
//   webpackOptions
// };



const webpack = require("@cypress/webpack-preprocessor");
const options = {
  webpackOptions: require("@vue/cli-service/webpack.config.js"),
  watchOptions: {}
};

module.exports = (on, config) => {
  on('file:preprocessor', webpack(options));

  return Object.assign({}, config, {
    // fixturesFolder: 'tests/fixtures',
    // integrationFolder: 'tests/specs',
    // screenshotsFolder: 'tests/screenshots',
    // videosFolder: 'tests/videos',
    // supportFile: 'tests/support/index.ts',

    // "baseUrl": "http://localhost:8080"
  });
};
