// Further imports are parsed with babel
require('es6-shim');
require('babel/register')({
    only: /(server|views)/
});
module.exports = require('./src/server/index.js');
