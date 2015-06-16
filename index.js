/**
 * Entry point for the server
 *
 * Any files imported from this point are parsed with babel
 */

require('babel/register')({
  only: /(src|test)/,
  stage: 0,
});

module.exports = require('./src/server/index.js');
