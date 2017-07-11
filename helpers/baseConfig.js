const path = require('path')

module.exports = {
  /**
   * webpack 转化的 app 的目录
   * @type {[type]}
   */
  appPath: path.join(process.cwd(), 'src'),
  /**
   * 项目根目录
   */
  rootPath: path.join(process.cwd()),
  /**
   * 预先加载的 sass 资源
   * @type {string|Array}
   */
  sassResources: path.join(process.cwd(), 'src/human/config.scss'),
  /**
   * html 模版所在位置
   * @type {[type]}
   */
  templateIndex: path.join(process.cwd(), 'index.html'),
  assetsRoot: path.join(process.cwd(), 'dist'),
  assetsSubDirectory: 'static',
  assetsPublicPath: '/',
  proxyTable: {},
  port: 8080,
  cssSourceMap: true,
  cssMinimize: false,
  cssExtract: false
}
