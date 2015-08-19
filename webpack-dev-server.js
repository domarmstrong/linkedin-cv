var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

/** NOTE: occasionally this stops working for no apparent reason
 * restarting the machine may correct the issue.
 * see - http://stackoverflow.com/questions/26708205/webpack-watch-isnt-compiling-changed-files
 */
new WebpackDevServer(webpack(config), {
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
