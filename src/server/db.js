"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 *
 * Returns a mongodb connection singleton
 */

import mongodb from 'promised-mongo';
import path from 'path';

const config = require(path.join(process.cwd(), 'config.js'));

/**
 * Create mongo connection using config
 */
function getConnection () {
  let { connectionString, dbName } = config.mongodb;
  // Cant use path.join as it messes up double '//' in connection strings
  if (! connectionString.endsWith('/')) {
    connectionString += '/';
  }
  if (dbName.startsWith('/')) {
    dbName = dbName.slice(1);
  }
  return mongodb(connectionString + dbName);
}

export var db = getConnection();
