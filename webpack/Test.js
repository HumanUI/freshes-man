const Base = require('./Base')

class Test extends Base {
  getWebpack () {
    // This is the webpack config used for unit tests.
    var webpack = require('webpack')
    var merge = require('webpack-merge')
    var baseWebpackConfig = this.getWebpackBase

    var webpackConfig = merge(baseWebpackConfig, {
      // use inline sourcemap for karma-sourcemap-loader
      module: {
        rules: this.getStyleLoaders()
      },
      devtool: '#inline-source-map',
      resolveLoader: {
        alias: {
          // necessary to to make lang="scss" work in test when using vue-loader's ?inject option
          // see discussion at https://github.com/vuejs/vue-loader/issues/724
          'scss-loader': 'sass-loader'
        }
      }
    })

    // no need for app entry during tests
    delete webpackConfig.entry

    return webpackConfig
  }
}
