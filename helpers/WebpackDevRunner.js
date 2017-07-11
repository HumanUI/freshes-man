const BaseRunner = require('./BaseRunner')
const Server = require('../build/Server.js')

class WebpackDevRunner extends BaseRunner {
  run () {
    return new Server(this.baseConfig).run()
  }
}

module.exports = WebpackDevRunner
