const defaultConfig = require('../helpers/baseConfig')
const path = require('path')
const webpack = require('webpack')

class Base {
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
    const browserEnv = {}

    // 合并默认设置的游览器环境变量和终端输入的环境变量
    Object.keys(this.config.browserEnv).forEach(name => {
      browserEnv[`process.env.${name}`] = process.env.hasOwnProperty(name)
        ? process.env[name]
        : this.config.browserEnv[name]
    })

    return {
      entry: {
        app: path.join(config.appPath, 'main.js')
      },
      output: {
        path: config.assetsRoot,
        filename: '[name].js',
        publicPath: config.assetsPublicPath
      },
      resolve: {
        extensions: ['.js', '.vue', '.json']
      },
      module: {
        rules: [
          {
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            include: [path.join(config.appPath), path.join(config.testPath)],
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
            include: [path.join(config.appPath), path.join(config.testPath)]
          },
          {
            test: /vue-human[\/\\].*\.js$/,
            loader: 'babel-loader',
            exclude: /vue-human[\/\\](node_modules)[\/\\].*/
          },
          {
            test: /vue-human-icons[\/\\].*\.js$/,
            loader: 'babel-loader',
            exclude: /vue-human-icons[\/\\](node_modules)[\/\\].*/
          },
          {
            test: /vue-human-env[\/\\].*\.js$/,
            loader: 'babel-loader',
            exclude: /vue-human-env[\/\\](node_modules)[\/\\].*/
          },
          {
            test: /strawes[\/\\].*\.js$/,
            loader: 'babel-loader',
            exclude: /strawes[\/\\](node_modules)[\/\\].*/
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
      },
      plugins: [
        new webpack.DefinePlugin({
          // process.BROWSER_ENV 即将移除，请勿使用
          'process.BROWSER_ENV': process.env.BROWSER_ENV || '"local"',
          ...browserEnv
        })
      ]
    }
  }
}

module.exports = Base
