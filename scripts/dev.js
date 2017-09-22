const WebpackDevRunner = require('../helpers/WebpackDevRunner')

module.exports = new WebpackDevRunner({
  browserEnv: require('./browserEnv')
}).run()
