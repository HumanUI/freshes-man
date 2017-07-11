const BaseRunner = require('./BaseRunner')
const Server = require('../build/Server.js')
const path = require('path')

class WebpackDevRunner extends BaseRunner {
  constructor () {
    super()
    this.baseConfig = {
      debug: true,
      templateIndex: path.join(process.cwd(), 'src/index.html')
    }
  }

  run () {
    return new Server(this.baseConfig).run()
  }
}

module.exports = WebpackDevRunner
