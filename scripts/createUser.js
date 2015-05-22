#!/usr/bin/env node
"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 *
 * Annoyingly mongo does not has sha1 build in so we must use a script to create users..
 *
 * Usage:
 *
 * node scripts/createUser.js -u username -p password
 */

require('babel/register')({
  only: /src/
});
var argv = require('minimist')(process.argv.slice(2));
var auth = require('../src/server/auth');

function wrap(str) {
   return '\n' + str + '\n';
}

auth.createUser(argv.u, argv.p).then(function (info) {
  process.stdout.write(wrap('User created id: ' + info._id + ' > ' + info.username));
}).catch(function (err) {
  process.stderr.write(wrap('Error: ' + err.message));
}).finally(function () {
  process.exit();
}).done();