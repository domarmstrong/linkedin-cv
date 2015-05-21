// Further imports are parsed with babel
require('babel/register')({
    only: /(server|views)/
});
module.exports = require('./src/server/index.js');
