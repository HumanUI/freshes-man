const WebpackDevRunner = require('../helpers/WebpackDevRunner')
const path = require('path')

function resolve (relativePath) {
  return path.join(process.cwd(), relativePath)
}

module.exports = new WebpackDevRunner({
  appPath: resolve('examples'),
  sassResources: resolve('examples/human/config.scss'),
  templateIndex: resolve('examples/index.html')
}).run()
