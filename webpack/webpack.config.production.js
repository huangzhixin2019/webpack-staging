const path = require('path')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')          // 生成html
const CleanWebpackPlugin = require('clean-webpack-plugin')        // 每次build清除dist文件夹
const ExtractTextPlugin = require('extract-text-webpack-plugin')  // 将css从js分离出来
const SpritesmithPlugin = require('webpack-spritesmith')          // 合成雪碧图插件
const ImageminPlugin = require('imagemin-webpack-plugin').default // 压缩图片
const method = require('./webpack.method')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const extractCSS = new ExtractTextPlugin('css/[name].css');       

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, '../src'),
  entry: {
    index: './index.js',
    ...method.entryList,
    vendors: [ 'jquery' ]        // 将框架文件单独打包成一个文件
  },
  optimization: {
    splitChunks: {               // 将框架文件单独打包成一个文件
      cacheGroups: {
        vendor: {
          chunks: "initial",
          test: "vendors",
          name: "vendors",
          enforce: true
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false
          },
          compress: {
            drop_console: true,          // 移除console.log
            drop_debugger: true          // 删除debugger语句
          }
        }
      }),
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'js/[name].[chunkhash].js'
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
      use: extractCSS.extract({
        fallback: 'style-loader',
        // publicPath: '/index/image/',          // 为生成的css里面的url添加前缀
        use: [{
          loader: 'css-loader',
        }, {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true          // 开启后sprite.less才能使用javascript代码
          }
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: [autoprefixer({ browsers: ["iOS >= 8", "Firefox >= 20", "Android > 4.0", "ie > 9"] })]
          }
        }]
      })
    }, {
      test: /\.(jpg|jpeg|png|svg|gif|woff2)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[hash].[ext]',
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
    extractCSS,

    new HtmlWebpackPlugin({
      // title: '主页',
      // favicon: path.resolve(__dirname,'favicon.ico'), // 生成的 html 文件设置 favicon
      filename: path.resolve(__dirname, '../dist/index.html'), 
      template: "index.html",
      chunks: ['vendors','index'],
      inlineSource: '.(js|css)$',
      minify: {
        collapseWhitespace: true                   // 去除所有空格
      }
    }),

    ...method.pluginList,

    // 设置每一次build之前先删除dist
    new CleanWebpackPlugin(
      ['dist/*'],　                                 //匹配删除的文件
      {
          root: path.resolve(__dirname, '..'),      //根目录
          verbose: true,        　　　　　　　　　　  //开启在控制台输出信息
          dry: false        　　　　　　　　　　      //启用删除文件
      }
    ),

    // 合成雪碧图
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, '../src/imgs/icons'),
        glob: '*.png'
      },
      target: {
        image: path.resolve(__dirname, '../src/imgs/sprite.png'),
        css: path.resolve(__dirname, '../src/less/sprite.less')
      },
      //设置sprite.png的引用格式
      apiOptions: {
        cssImageRef: '../imgs/sprite.png'  //cssImageRef为必选项
      },
      //配置spritesmith选项，非必选
      spritesmithOptions: {
        algorithm: 'binary-tree',    //设置图标的排列方式
        padding: 20
      }
    }),

    // 压缩图片
    // new ImageminPlugin({
    //   pngquant: {
    //     quality: '20-80'
    //   }
    // })
    
  ]
}
