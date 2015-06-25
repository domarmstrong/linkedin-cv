"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 *
 * Returns a mongodb connection singleton
 */

import mongodb from 'promised-mongo';
import path from 'path';

const config = require(path.join(process.cwd(), 'config.js'));

let connectionString = config.mongodb.connectionString;

if (process.env.NODE_ENV === 'test') {
  connectionString += '_test';
}
export var db = mongodb(connectionString);
