const _ = require('lodash')
const webpack = require('webpack')
const path = require('path')
const production = process.env.NODE_ENV === 'production'

let entry = {
  'index': './src/index.ts'
}
if (production) {
  entry = _.assign({}, entry, {'index.min': './src/index.ts'})
}

module.exports = {
  entry,
  output: {
    path: path.resolve(__dirname, '_bundles'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    library: 'OpenSea'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true,
      include: /\.min\.js$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            query: {
              declaration: false
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
}
