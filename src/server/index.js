"use strict";

import koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';
import debug from 'debug';
import path from 'path';
import http from 'http';

const d = debug('linkedIn-cv:server');
const app = koa();

app.name = 'linkedIn-CV';
app.env = process.env.NODE_ENV;
app.port = 8080;

app.config = {
    mongodb: {
        connectionString: 'monodb://127.0.0.1:27017',
        dbName: 'linkedin-cv',
    },
    linkedIn: {
        username: 'your linkedIn username',
        password: 'your linkedIn password',
        clientId: 'linkedIn app client id',
        clientSecret: 'linkedIn app client secret',
        redirectUrl: 'http://127.0.0.1:8080/auth/linkedin/redirect',
    },
};

// static. NOTE: in production use NGINX to serve /public so these route is never reached
app.use(mount('/public', serve(path.join(process.cwd(), 'public'))));
app.use(mount('/public', serve(path.join(process.cwd(), 'build'))));
// router
require('./routes')(app);

app.on('error', function (err) {
    // TODO: Error handling
    console.log(err);
    debug(err);
});

app.start = function start() {
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
};

export { app };
