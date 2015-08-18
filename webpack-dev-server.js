var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  contentBase: './public',
  publicPath: config.output.publicPath,
  hot: true,
  noInfo: true,
  filename: config.output.filename,
  historyApiFallback: true,
  stats: { colors: true },
  proxy: {
    '*': 'http://localhost:8080',
  },
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }
  var red = '\033[31m';
  process.stdout.write(red + '\n--------- Listening at localhost: 3000 ---------\n\n');
});
