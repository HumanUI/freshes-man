class BaseRunner {
  config () {
    throw new Error('You must override `config` method.')
  }

  run () {
    throw new Error('You must override `run` method.')
  }
}

module.exports = BaseRunner
