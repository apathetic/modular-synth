var path = require('path')

module.exports = {
  build: {
    env: { NODE_ENV: JSON.stringify('production')},
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    cssSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: false
  },
  dev: {
    env: { NODE_ENV: JSON.stringify('development')},
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT
    assetsSubDirectory: 'static',
    proxyTable: {
      // '/api': {
      //   target: 'http://localhost:8081'
      // }
    },
    poll: false,
    cssSourceMap: false
  }
}
