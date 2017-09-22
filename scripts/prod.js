const WebpackProdRunner = require('../helpers/WebpackProdRunner')

module.exports = new WebpackProdRunner({
  cssSourceMap: false,
  cssMinimize: true,
  cssExtract: true,
  browserEnv: require('./browserEnv')
}).run()
