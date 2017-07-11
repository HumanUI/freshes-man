const Base = require('./Base')

class Prod extends Base {
  getWebpackProd () {
    var config = this.config
    var path = require('path')
    var webpack = require('webpack')
    var merge = require('webpack-merge')
    var baseWebpackConfig = require('./webpack.base.conf')
    var CopyWebpackPlugin = require('copy-webpack-plugin')
    var HtmlWebpackPlugin = require('html-webpack-plugin')
    var ExtractTextPlugin = require('extract-text-webpack-plugin')
    var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

    var webpackConfig = merge(baseWebpackConfig, {
      module: {
        rules: this.getStyleLoaders({
          sourceMap: config.cssSourceMap,
          extract: true
        })
      },
      devtool: false,
      output: {
        path: config.assetsRoot,
        filename: this.getAssetsPath('js/[name].[chunkhash].js'),
        chunkFilename: this.getAssetsPath('js/[id].[chunkhash].js')
      },
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          sourceMap: true
        }),
        // extract css into its own file
        new ExtractTextPlugin({
          filename: this.getAssetsPath('css/[name].[contenthash].css')
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
          cssProcessorOptions: {
            safe: true,
            discardComments: {
              removeAll: true
            }
          }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: config.templateIndex,
          inject: true,
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
            // more options:
            // https://github.com/kangax/html-minifier#options-quick-reference
          },
          // necessary to consistently work with multiple chunks via CommonsChunkPlugin
          chunksSortMode: 'dependency'
        }),
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function (module, count) {
            // any required modules inside node_modules are extracted to vendor
            return (
              module.resource &&
              /\.js$/.test(module.resource) &&
              module.resource.indexOf(
                path.join(__dirname, '../node_modules')
              ) === 0
            )
          }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor']
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
          {
            from: path.resolve(__dirname, '../static'),
            to: config.assetsSubDirectory,
            ignore: ['.*']
          }
        ])
      ]
    })

    if (config.productionGzip) {
      var CompressionWebpackPlugin = require('compression-webpack-plugin')

      webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
          asset: '[path].gz[query]',
          algorithm: 'gzip',
          test: new RegExp(
            '\\.(' +
            config.productionGzipExtensions.join('|') +
            ')$'
          ),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }

    if (config.bundleAnalyzerReport) {
      var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      webpackConfig.plugins.push(new BundleAnalyzerPlugin())
    }

    return webpackConfig
  }

  run () {
    var ora = require('ora')
    var rm = require('rimraf')
    var path = require('path')
    var chalk = require('chalk')
    var webpack = require('webpack')
    var config = this.config
    var webpackConfig = this.getWebpackProd()

    var spinner = ora('building for production...')
    spinner.start()

    rm(path.join(config.assetsRoot, config.assetsSubDirectory), err => {
      if (err) throw err
      webpack(webpackConfig, function (err, stats) {
        spinner.stop()
        if (err) throw err
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n')

        console.log(chalk.cyan('  Build complete.\n'))
        console.log(chalk.yellow(
          '  Tip: built files are meant to be served over an HTTP server.\n' +
          '  Opening index.html over file:// won\'t work.\n'
        ))
      })
    })
  }
}

module.exports = Prod
