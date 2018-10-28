const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');
// const vueConfig = require('@vue/cli-service/webpack.config.js');
const path = require('path');


module.exports = (baseConfig, env, config) => {
  /* */

  config.plugins.push(new ForkTsCheckerWebpackPlugin({
    tslint: true,
    vue: true
  }));

  config.module.rules.push({
    test: /\.ts$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true // used with ForkTsCheckerWebpackPlugin
        }
      }
    ],
  });

  config.module.rules.push({
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'css-loader',
      'sass-loader'
    ],
  });

  config.resolve.extensions.push('.ts', '.vue');
  // config.resolve.alias['@'] = ''
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src')
  };

  return config;
  /* /* /



  return {
    ...vueConfig,            // use vue's webpack configuration by default
    entry: config.entry,     // retain storybook's entry
    output: config.output,   // retain storybook's output

    resolve: {                        // point storybook's vue to the project's vue
      ...vueConfig.resolve,
      alias: {
        // ...vueConfig.resolve.alias,
        vue$: config.resolve.alias.vue$
        // vue$: 'vue/dist/vue.esm.js',
        // '@': path.join(__dirname, '..', 'src'),
      }
    }
  };
  /* */


};