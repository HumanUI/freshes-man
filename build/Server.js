class Server {
  constructor (config) {
    this.config = config
  }

  getAssetsPath (_path) {
    var path = require('path')
    const config = this.config
    var assetsSubDirectory = process.env.NODE_ENV === 'production'
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory
    return path.posix.join(assetsSubDirectory, _path)
  }

  getCssLoaders (options) {
    var path = require('path')
    var config = this.config
    var ExtractTextPlugin = require('extract-text-webpack-plugin')

    options = options || {}

    var cssLoader = {
      loader: 'css-loader',
      options: {
        minimize: process.env.NODE_ENV === 'production',
        sourceMap: options.sourceMap
      }
    }

    // generate loader string, object, array to be used with extract text plugin
    function generateLoaders (loader) {
      var loaders = [cssLoader]

      if (loader) {
        // wrap string & object to array
        if (typeof loader === 'string' ||
          (typeof loader === 'object' && loader.constructor === Object)) {
          loader = [loader]
        }

        loader.forEach(item => {
          loaders.push(handleLoader(item))
        })
      }

      // Extract CSS when that option is specified
      // (which is the case during production build)
      if (options.extract) {
        return ExtractTextPlugin.extract({
          use: loaders,
          fallback: 'vue-style-loader'
        })
      } else {
        return ['vue-style-loader'].concat(loaders)
      }
    }

    // generate loader string and object to loader config object
    function handleLoader (loader) {
      if (typeof loader === 'string') {
        return {
          loader: loader + '-loader',
          options: {
            sourceMap: options.sourceMap
          }
        }
      } else if (typeof loader === 'object' && loader.constructor === Object) {
        return loader
      }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
      css: generateLoaders(),
      postcss: generateLoaders(),
      less: generateLoaders('less'),
      sass: generateLoaders([
        {
          loader: 'sass-loader',
          options: {
            sourceMap: options.sourceMap,
            indentedSyntax: true
          }
        }
      ]),
      scss: generateLoaders([
        'sass',
        // you can need sass-resources-loader for your sass
        {
          loader: 'sass-resources-loader',
          options: {
            // must choose a scss file
            resources: path.join(__dirname, '../src/human/config.scss')
          }
        }
      ]),
      stylus: generateLoaders('stylus'),
      styl: generateLoaders('stylus')
    }
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
    var utils = require('./utils')
    var config = this.config
    var isProduction = process.env.NODE_ENV === 'production'

    return {
      loaders: this.getCssLoaders({
        sourceMap: isProduction
          ? config.build.productionSourceMap
          : config.dev.cssSourceMap,
        extract: isProduction
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
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
          ? config.build.assetsPublicPath
          : config.dev.assetsPublicPath
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
        rules: this.getStyleLoaders({ sourceMap: config.dev.cssSourceMap })
      },
      // cheap-module-eval-source-map is faster for development
      devtool: '#cheap-module-eval-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env': config.dev.env
        }),
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

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
    }

    var opn = require('opn')
    var path = require('path')
    var express = require('express')
    var webpack = require('webpack')
    var proxyMiddleware = require('http-proxy-middleware')
    var webpackConfig = this.getWebpackDev()

    // default port where dev server listens for incoming traffic
    var port = process.env.PORT || config.dev.port
    // automatically open browser, if not set will be false
    var autoOpenBrowser = !!config.dev.autoOpenBrowser
    // Define HTTP proxies to your custom API backend
    // https://github.com/chimurai/http-proxy-middleware
    var proxyTable = config.dev.proxyTable

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
    var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
    app.use(staticPath, express.static('./static'))

    var uri = 'http://localhost:' + port

    var _resolve
    var readyPromise = new Promise(resolve => {
      _resolve = resolve
    })

    console.log('> Starting dev server...')
    devMiddleware.waitUntilValid(() => {
      console.log('> Listening at ' + uri + '\n')
      // when env is testing, don't need open it
      if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri)
      }
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
