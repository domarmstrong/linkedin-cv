// Further imports are parsed with babel
require('babel/register')({
  only: /src/
});
module.exports = require('./src/server/index.js');
