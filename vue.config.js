const path = require('path');


module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',

  /**
   * Configure the base URL for development (ie. to use Vue dev server
   * and HMR) or for production (ie. serve static assets from /static).
   */
  // publicPath: '/static/builds/',

  /**
   * Handle all CSS generation. We use CSS modules in Vue components; we
   * also generate legacy CSS via the `lliTheme.js` which injects a few
   * theme variables.
   */
  css: {
    extract: { ignoreOrder: true },
    requireModuleExtension: true,
    loaderOptions: {
      css: {
        modules: {
          localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:6]' : '[name]__[local]',
        },
      },
      scss: {
        prependData: '@import "~@/styles/variables.scss";',
      },
    },
  },

  /**
   * Configure webpack here.
   * Update aliases, plugins, devServer
   */
  chainWebpack: (config) => {
    config.output.filename('js/[name].js');

    if (process.env.NODE_ENV !== 'production') {
      config.set('watchOptions', { poll: 100 });
      config.set('devtool', 'eval-source-map');
    }

    // ----- Aliases -----
    // set up a few helpful aliases to be used throughout the codebase
    config.resolve.alias.set('@', path.resolve(__dirname, './src'));
    config.resolve.alias.set('@test', path.resolve(__dirname, './tests'));
  },
};