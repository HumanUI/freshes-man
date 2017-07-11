class BaseRunner {
  constructor (config) {
    this.baseConfig = config
  }

  config () {
    throw new Error('You must override `config` method.')
  }

  run () {
    throw new Error('You must override `run` method.')
  }
}

module.exports = BaseRunner
