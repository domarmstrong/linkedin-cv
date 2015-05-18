// Further imports are parsed with babel
require('es6-shim');
require('babel/register')({
    only: /server/
});
module.exports = require('./server/index.js');
