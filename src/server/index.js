"use strict";

import koa from 'koa';
import koa_static from 'koa-static';
import debug from 'debug';
import path from 'path';
import http from 'http';

function serveStatic(relative_path) {
    return koa_static(path.join(process.cwd(), relative_path));
}

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

serveStatic('public');
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
