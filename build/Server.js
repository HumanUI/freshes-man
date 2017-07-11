const defaultConfig = require('../helpers/baseConfig')
const path = require('path')

class Server {
  constructor (baseConfig) {
    this.config = Object.assign({}, defaultConfig, baseConfig)
    if (this.config.debug) {
      console.log(this.config)
    }
  }

  getAssetsPath (relativePath) {
    const assetsSubDirectory = this.config.assetsSubDirectory
    return path.posix.join(assetsSubDirectory, relativePath)
  }

  getCssLoaders (options) {
    return require('./cssLoaders')(options, this.config)
  }

  getStyleLoaders (options) {
    var output = []
    var loaders = this.getCssLoaders(options)
    for (var extension in loaders) {
      var loader = loaders[extension]
      output.push({
        test: new RegExp('\\.' + extension + '$'),
        use: loader
      })
    }
    return output
  }

  resolve (dir) {
    const path = require('path')
    return path.join(__dirname, '..', dir)
  }

  getVueLoader () {
    var config = this.config

    return {
      loaders: this.getCssLoaders({
        sourceMap: config.cssSourceMap,
        extract: config.cssExtract
      })
    }
  }

  getWebpackBase () {
    const config = this.config
    return {
      entry: {
        app: this.resolve('src/main.js')
      },
      output: {
        path: config.assetsRoot,
        filename: '[name].js',
        publicPath: config.assetsPublicPath
      },
      resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          '@': this.resolve('src')
        }
      },
      module: {
        rules: [
          {
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            include: [this.resolve('src'), this.resolve('test')],
            options: {
              formatter: require('eslint-friendly-formatter')
            }
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: this.getVueLoader()
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [this.resolve('src'), this.resolve('test')]
          },
          {
            test: /vue-human(-\w+)?[\/\\].*\.js$/,
            loader: 'babel-loader',
            exclude: /vue-human(-\w+)?[\/\\]node_modules[\/\\].*/
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: this.getAssetsPath('img/[name].[hash:7].[ext]')
            }
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: this.getAssetsPath('fonts/[name].[hash:7].[ext]')
            }
          }
        ]
      }
    }
  }

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
          template: 'index.html',
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
