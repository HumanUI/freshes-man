const Base = require('./Base')
const path = require('path')

class Server extends Base {
  getWebpackDev () {
    var webpack = require('webpack')
    var config = this.config
    var merge = require('webpack-merge')
    var baseWebpackConfig = this.getWebpackBase()
    var HtmlWebpackPlugin = require('html-webpack-plugin')
    var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

    // add hot-reload related code to entry chunks
    Object.keys(baseWebpackConfig.entry).forEach(function (name) {
      baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
    })

    return merge(baseWebpackConfig, {
      module: {
        rules: this.getStyleLoaders({ sourceMap: config.cssSourceMap })
      },
      // cheap-module-eval-source-map is faster for development
      devtool: '#cheap-module-eval-source-map',
      plugins: [
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: config.templateIndex,
          inject: true
        }),
        new FriendlyErrorsPlugin()
      ]
    })
  }

  run () {
    var config = this.config
    var path = require('path')
    var express = require('express')
    var webpack = require('webpack')
    var proxyMiddleware = require('http-proxy-middleware')
    var webpackConfig = this.getWebpackDev()

    // default port where dev server listens for incoming traffic
    var port = process.env.PORT || config.port
    // Define HTTP proxies to your custom API backend
    // https://github.com/chimurai/http-proxy-middleware
    var proxyTable = config.proxyTable

    var app = express()
    var compiler = webpack(webpackConfig)

    var devMiddleware = require('webpack-dev-middleware')(compiler, {
      publicPath: webpackConfig.output.publicPath,
      quiet: true
    })

    var hotMiddleware = require('webpack-hot-middleware')(compiler, {
      log: () => {}
    })
    // force page reload when html-webpack-plugin template changes
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({ action: 'reload' })
        cb()
      })
    })

    // proxy api requests
    Object.keys(proxyTable).forEach(function (context) {
      var options = proxyTable[context]
      if (typeof options === 'string') {
        options = { target: options }
      }
      app.use(proxyMiddleware(options.filter || context, options))
    })

    // handle fallback for HTML5 history API
    app.use(require('connect-history-api-fallback')())

    // serve webpack bundle output
    app.use(devMiddleware)

    // enable hot-reload and state-preserving
    // compilation error display
    app.use(hotMiddleware)

    // serve pure static assets
    var staticPath = path.posix.join(config.assetsPublicPath, config.assetsSubDirectory)
    app.use(staticPath, express.static('./static'))

    var uri = 'http://localhost:' + port

    var _resolve
    var readyPromise = new Promise(resolve => {
      _resolve = resolve
    })

    console.log('> Starting dev server...')
    devMiddleware.waitUntilValid(() => {
      console.log('> Listening at ' + uri + '\n')
      _resolve()
    })

    var server = app.listen(port)

    return {
      ready: readyPromise,
      close: () => {
        server.close()
      }
    }
  }
}

module.exports = Server
