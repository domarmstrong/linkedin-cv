/**
 * Entry point for the server
 *
 * Any files imported from this point are parsed with babel
 */

require('./babel_register');

module.exports = require('./src/server/index.js');
