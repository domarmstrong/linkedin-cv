"use strict";

import koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';
import debug from 'debug';
import path from 'path';
import http from 'http';

const config = require(path.join(process.cwd(), 'config.js'));
const d = debug('linkedIn-cv:server');
const app = koa();

app.env = config.env || process.env.NODE_ENV;
app.name = config.app_name || 'linkedIn-CV';
app.port = config.app_port || 8080;
app.secret = config.app_secret;

// static. NOTE: in production use NGINX to serve /public so these route is never reached
app.use(mount('/public', serve('../../public')));
app.use(mount('/public', serve('../../build')));
// router
require('./routes')(app);

app.on('error', function (err) {
    // TODO: Error handling
    console.log('blah', err.stack);
    debug(err);
});

function init() {
    let server = http.createServer(app.callback());
    server.on('error', err => {
        debug('Error:', err);
        if (err.syscall !== 'listen') {
            throw err;
        }
        switch (err.code) {
            case 'EACCES':
                console.err(app.port + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.err(app.port + ' is already in use');
                process.exit(1);
                break;
            default:
                throw err;
        }
    });
    server.on('listening', () => console.info('Listening on: ' + app.port));
    server.listen(app.port);
}

export { init };
