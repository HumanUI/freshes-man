const BaseRunner = require('./BaseRunner')
const Server = require('../webpack/Server.js')

class WebpackDevRunner extends BaseRunner {
  run () {
    return new Server(this.baseConfig).run()
  }
}

module.exports = WebpackDevRunner
