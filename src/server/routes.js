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
import { CV } from '../views/cv.jsx';
import { render } from './renderer';

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
    console.log(this);
    let params = queryString.parse(this.req._parsedUrl.query);
    linkedIn.handleAuthResponse(this, params);
});

privateRoutes.get('/admin', function *(next) {
    yield render( Login );
});

privateRoutes.get('/admin/update', function *(next) {
    this.body = yield linkedIn.updateProfile(this).then(record => {
        return JSON.stringify(record);
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
        console.log(this);
        if (true) {//this.isAuthenticated()) {
            yield next
        } else {
            this.redirect('/login')
        }
    });
    // Private routes
    app.use(privateRoutes.middleware());
};
