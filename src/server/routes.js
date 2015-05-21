"use strict";

import koaRouter from 'koa-router';
import queryString from 'query-string';
import linkedIn from './linkedIn';
import Q from 'q';
import Qfs from 'q-io/fs';
import React from 'react';
import debug from 'debug';
import _ from 'underscore';
import path from 'path';
import { render } from './renderer';

// Views
import { CV } from '../views/cv.jsx';
import { Login } from '../views/login.jsx';

const d = debug('linkedIn-cv:server');
const publicRoutes = koaRouter();
const privateRoutes = koaRouter();

publicRoutes.get('/', function *(next) {
    // Get profile data and html template in parallel
    this.body = yield linkedIn.getProfile()
        .then(profile => render( CV, profile ));
});

privateRoutes.get('/admin', function *(next) {
    yield render( CV );
});

/**
 * Deal with responses from linkedIn auth
 */
publicRoutes.get('/auth/linkedin/redirect', function *(next) {
    let params = queryString.parse(this.req._parsedUrl.query);
    yield linkedIn.handleAuthResponse(this, params);
});

privateRoutes.get('/admin', function *(next) {
    yield render( Login );
});

privateRoutes.get('/admin/update', function *(next) {
    yield linkedIn.updateProfile(this).then(record => {
        return this.body = JSON.stringify(record);
    }).catch(err => {
        if (err.message === linkedIn.AUTH_REQUIRED) {
            // No auth found in database, redirect to linkedIn oauth
            linkedIn.requestUserAuth(this);
        } else {
            // rethrow error for outer handler
            throw err;
        }
    });
});

/**
 * Use the koa-router
 * @example
 * // require('./routes')(app);
 * @param app: koa app
 */
export default function (app) {
    // Handle routing errors
    app.use(function *(next) {
        // Handle errors from actual routes
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
            this.app.emit('error', err, this);
        }
        // Handle 404s etc
        if (this.response.status === 404) {
            this.body = 'Woops 404. Page not found';
        }
    });

    // Public routes
    app.use(publicRoutes.middleware());
    // Require authentication from now
    app.use(function *(next) {
        if (this.isAuthenticated()) {
            yield next
        } else {
            this.redirect('/login')
        }
    });
    // Private routes
    app.use(privateRoutes.middleware());
};
