#!/usr/bin/env node
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */
var app = require('./').app;

/**
 * Keep this config private
 * do not push to github etc
 */
app.config.linkedIn = {
    username: 'user@example.com',
    password: 'xxxxxx',
    clientId: 'xxxxxx',
    clientSecret: 'xxxxxx',
    redirectUrl: 'http://127.0.0.1:8080/auth/linkedin/redirect',
};
app.config.mongodb = {
    connectionString: 'mongodb://127.0.0.1:27017',
    dbName: 'linkedin-cv',
};
app.port = process.env.PORT || 8080;
app.start();