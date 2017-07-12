const path = require('path')

module.exports = {
  /**
   * webpack 转化的 app 的目录
   * @type {String}
   */
  appPath: path.join(process.cwd(), 'src'),

  /**
   * 项目根目录
   * @type {String}
   */
  rootPath: path.join(process.cwd()),

  /**
   * 测试目录
   * @type {String}
   */
  testPath: path.join(process.cwd(), 'test'),

  /**
   * 预先加载的 sass 资源
   * @type {String|Array}
   */
  sassResources: path.join(process.cwd(), 'src/human/config.scss'),

  /**
   * html 模版所在位置
   * @type {String}
   */
  templateIndex: path.join(process.cwd(), 'index.html'),

  /**
   * 静态资源生成的目录
   * @type {String}
   */
  assetsRoot: path.join(process.cwd(), 'dist'),

  /**
   * 静态资源子目录
   * @type {String}
   */
  assetsSubDirectory: 'static',

  /**
   * 地址栏路径
   * @type {String}
   */
  assetsPublicPath: '/',

  /**
   * 映射表
   * @type {Object}
   */
  proxyTable: {},

  /**
   * 端口号
   * @type {Number}
   */
  port: 8080,

  /**
   * css 的 sourceMap
   * @type {Boolean}
   */
  cssSourceMap: true,

  /**
   * css 是否压缩
   * @type {Boolean}
   */
  cssMinimize: false,

  /**
   * css 是否单独放入某个文件
   * @type {Boolean}
   */
  cssExtract: false,

  /**
   * 生产环境是否开启 gzip
   * @type {Boolean}
   */
  productionGzip: false,

  /**
   * 生产环境 Gzip 的扩展名
   * @type {Array}
   */
  productionGzipExtensions: ['js', 'css'],

  /**
   * 是否提交统计报表
   * @type {Boolean}
   */
  bundleAnalyzerReport: process.env.npm_config_report
}
