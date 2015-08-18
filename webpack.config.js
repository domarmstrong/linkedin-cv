var webpack = require('webpack');
var path = require('path');

module.exports = (function makeConfig () {
  return {
    context: __dirname + '/src/client',
    devtool: 'eval',
    entry: {
      app: [
        'webpack-dev-server/client?http://0.0.0.0:3000',
        'webpack/hot/only-dev-server',
        './bootstrap.js'
      ],
      vendor: [
        'classnames',
        'react',
        'react-dom',
        'react-router',
        'react-router/lib/Location',
        'react-router/lib/BrowserHistory',
        'socket.io-client',
        'superagent',
        'superagent-promise',
      ],
    },

    output: {
      path: __dirname + '/build',
      publicPath: '/public',
      filename: 'app.js',
    },

    resolve: {
      extensions: ['', '.js', '.jsx']
    },

    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
        loaders: ['react-hot', 'babel?stage=0'],
      }, {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      }],
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.js'),
    ]
  };
})();
