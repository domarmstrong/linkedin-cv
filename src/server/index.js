"use strict";

import koa from 'koa';
import path from 'path';
import http from 'http';
import session from 'koa-generic-session';
import bodyParser from 'koa-bodyparser';
import passport from 'koa-passport';
import { passportSerialize, passportDeserialize, passportStrategy } from './auth';
import { Strategy as LocalStrategy } from 'passport-local';
import MongoStore from 'koa-generic-session-mongo';
import gzip from 'koa-gzip';
import fresh from 'koa-fresh';
import etag from 'koa-etag';
import socketIo from './socketIo';
import log from './log';

const config = require(path.join(process.cwd(), 'config.js'));
const app = koa();

log('Debug is active');

app.env = config.env || process.env.NODE_ENV;
app.name = config.app_name || 'linkedIn-CV';
app.port = config.app_port || 8080;

app.use(gzip());
app.use(fresh());
app.use(etag());

// session
app.keys = [ config.app_secret ];
app.use(session({
  store: new MongoStore({
    url: config.mongodb.connectionString,
    collection: 'sessions',
  })
}));

// body parser
app.use(bodyParser());

// Authentication
passport.serializeUser(passportSerialize);
passport.deserializeUser(passportDeserialize);
passport.use(new LocalStrategy(passportStrategy));
app.use(passport.initialize());
app.use(passport.session());

// router
require('./routing/routing')(app);

app.on('error', function (err) {
  log.error(err);
});

function init() {
  let server = http.createServer(app.callback());
  server.on('error', err => {
    log.error(err);
    if (err.syscall !== 'listen') {
      throw err;
    }
    switch (err.code) {
      case 'EACCES':
        log.fatal(app.port + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        log.fatal(app.port + ' is already in use');
        process.exit(1);
        break;
      default:
        throw err;
    }
  });
  server.on('listening', () => log('Listening on: ' + app.port));

  // Set up socket io
  socketIo(server);

  server.listen(app.port);

  return server;
}

export { init };
