#!/usr/bin/env node
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

/**
 * Initialise the server.
 *
 * Add a config file in the projects current working directory with the following information:
 * (Make sure this config is not published anywhere public like github)
 *
 * ```
 * // config.js
 * module.exports = {
 *   "app_name": "My name",
 *   "app_port": 8080,
 *   "app_secret": "unique private string",
 *
 *   "linkedIn": {
 *     "username": "linkedIn username",
 *     "password": "linkedIn password",
 *     "clientId": "linkedIn api client id",
 *     "clientSecret": "linkeIn api client secret",
 *     "redirectUrl": "http://127.0.0.1:8080/auth/linkedin/redirect"
 *   },
 *
 *   "mongodb": {
 *     "connectionString": "mongodb://127.0.0.1:27017",
 *     "dbName": "linkedin-cv"
 *   }
 * };
 ```
 */

require('./').init();
