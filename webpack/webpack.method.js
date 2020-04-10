/**
 * 多页面自动生成webpack的entry所需参数及HtmlWebpackPlugin生成html
 * @author: ChenJunhan
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')

function readFileList(paths, htmlList, entryList) {
  var files = fs.readdirSync(paths);                          // 获取'src/pages'目录下的内容

  // 过滤掉pages下非文件夹的内容
  files = files.filter(function (itm) {
      var stat = fs.statSync(paths + '\\' + itm);

      // 判断是否为文件夹
      return stat.isDirectory()
  })

  files.forEach((f) => {
    var html = f + '.html';
    var js = f + '.js'

    // 添加html-webpack-plugin生成页面
    htmlList.push(
      new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, '../dist/pages/' + html),
        template: "./pages/" + f + "/" + html,
        chunks: ['vendors', f],
        inlineSource: '.(js|css)$',
        minify: {
          collapseWhitespace: true                  
        }
      })
    )
    entryList[f] = "./pages/" + f + "/" + js;        // 添加entry入口文件

  })

}

var htmlList = [];
var entryList = {};
readFileList(path.resolve(__dirname, '../src/pages'), htmlList, entryList);

module.exports = {
  entryList: entryList,              // entry list
  pluginList: htmlList           // plugin list
};