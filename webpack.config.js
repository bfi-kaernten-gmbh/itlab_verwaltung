const webpack = require('webpack');
const path = require('path');

let config = {
  entry: './js/index.js',
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // files ending with .js
        exclude: /(node_modules|bowe_components)/, // exclude the node_modules directory
        loader: 'babel-loader' // use this (babel-core) loader
      },
    ]
  },
  plugins: [

  ],
  devServer: {
    contentBase: path.resolve(__dirname, './'), // A directory or URL to server the HTML content from
    historyApiFallback: true, // fallback to /index.html for Single Page Application
    inline: true, // inline mode (set false to diable including client scripts (like liverelload))
    open: false, // open defaukt browser while launching
    compress: true,
    port: 3000
  },
  devtool: 'eval-source-map'
};

if (process.env.Node_ENV === 'production') {
  console.log(hi);
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      }
    })
    // new UglifyJSPlugin({
    //   test: /\.js($|\?)/i,
    //   exclude: /node_modules/
    // })
  )
}

module.exports = config;
