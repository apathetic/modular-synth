'use strict'

const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    hot: true,
    host: process.env.HOST || config.dev.host,
    port: process.env.PORT || config.dev.port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin, DashboardPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new DashboardPlugin(),
    new webpack.DefinePlugin({ 'process.env': require('../config/dev.env') }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      serviceWorkerLoader: `<script>${ fs.readFileSync(path.join(__dirname, './service-worker-dev.js'), 'utf-8') }</script>`
    }),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here: http://${config.dev.host}:${config.dev.port}`]
      }
    })
  ]
})
