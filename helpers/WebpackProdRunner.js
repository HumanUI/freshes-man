const BaseRunner = require('./BaseRunner')
const Prod = require('../build/Prod.js')

class WebpackProdRunner extends BaseRunner {
  run () {
    return new Prod(this.baseConfig).run()
  }
}

module.exports = WebpackProdRunner
