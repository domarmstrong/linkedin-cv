"use strict";

import koaRouter from 'koa-router';
import queryString from 'query-string';
import linkedIn from './linkedIn';
import Q from 'q';
import React from 'react';
import { CV } from '../views/cv.jsx';
import { HTML } from '../views/html.jsx';
import debug from 'debug';

const d = debug('linkedIn-cv:server');
const router = koaRouter();

router.get('/', function *(next) {
    this.body = yield Q.try(() => {
        return linkedIn.getProfile();
    }).then(profile => {
        return React.renderToString(<HTML><CV { ...profile } /></HTML>);
    }).catch(err => {
        console.error('Err', err.stack);
        next();
    });
});

router.get('/admin', function *(next) {
    this.body = yield linkedIn.updateProfile(this).then(record => {
        return JSON.stringify(record);
    }).catch(err => {
        console.error('Err', err.stack);
        next();
    });
});

/**
 * Request authorisation from the user for linkedIn
 */
router.get('/auth/linkedin', function *(next) {
    linkedIn.requestUserAuth(this);
});

/**
 * Deal with responses from linkedIn auth
 */
router.get('/auth/linkedin/redirect', function *(next) {
    let params = queryString.parse(this.req._parsedUrl.query);
    linkedIn.handleAuthResponse(this, params);
});

/**
 * Use the koa-router
 * @example
 * // require('./routes')(app);
 * @param app
 */
export default function (app) {
    app.use(router.routes());
    app.use(router.allowedMethods());
};
