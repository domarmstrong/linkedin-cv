/**
 * Entry point for the server
 *
 * Any files imported from this point are parsed with babel
 */

require('babel/register')({
  only: /(src|test)/
});

module.exports = require('./src/server/index.js');
