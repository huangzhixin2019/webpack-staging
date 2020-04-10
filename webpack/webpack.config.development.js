const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const port = 7000;                 // webpack-dev-server 端口号
const method = require('./webpack.method')

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, '../src'),
  entry: {
    index: './index.js',
    ...method.entryList
  },
  resolve: {
    extensions: ['.js', '.less', '.css', '.jpg', '.png', '.svg', '.woff2', '.gif'],
    alias: {
      jquery: 'jquery/dist/jquery.min.js'
    }
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'js/[name].[hash].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader'
      }]
    }, {
      test: /\.(less|css)$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      }, {
        loader: 'less-loader',
        options: {
          sourceMap: true,
          javascriptEnabled: true          // 开启后sprite.less才能使用javascript代码
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: [autoprefixer({ browsers: ["iOS >= 8", "Firefox >= 20", "Android > 4.0", "ie > 9"] })]       // 兼容ie9， ios8
        }
      }]
    }, {
      test: /\.(jpg|jpeg|png|svg|gif|woff2)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[hash].[ext]'
        }
      }]
    }, {
      test: /\.html$/,
      use: {
          loader: 'html-loader'
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../dist/index.html',
      template: "index.html",
      chunks: ['index'],
      inlineSource: '.(js|css)$'
    }),

    ...method.pluginList,
    
    // 开启webpack全局热更新
    new webpack.HotModuleReplacementPlugin(),

    // 当接收到热更新信号时，在浏览器console控制台打印更多可读性高的模块名称等信息
    new webpack.NamedModulesPlugin()
  ],
  devServer: {
    port,
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8300'
      }
    },
    overlay: true,
    stats: {
      assets: false,
      chunks: false,
      timings: true,
      version: false
    }
  }
}
