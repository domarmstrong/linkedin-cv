"use strict";

import koaRouter from 'koa-router';
import queryString from 'query-string';
import linkedIn from './linkedIn';
import Q from 'q';
import Qfs from 'q-io/fs';
import React from 'react';
import { CV } from '../views/cv.jsx';
import debug from 'debug';
import _ from 'underscore';
import path from 'path';

const d = debug('linkedIn-cv:server');
const router = koaRouter();
let app;

let htmlTemplate = '';
/**
 * Get the compiled html template page and cache it
 * @return {String} html
 */
function getHtmlTemplate() {
    if (htmlTemplate) return Q(htmlTemplate);
    return Qfs.read(path.join(process.cwd(), '/public/index.html')).then(html => {
        // Compile to underscore template
        htmlTemplate =  _.template(html);
        return htmlTemplate;
    });
}

router.get('/', function *(next) {
    this.body = yield Q.try(() => {
        return linkedIn.getProfile();
    }).then(profile => {
        return getHtmlTemplate().then(template => {
            return template({
                name: app.name,
                body: React.renderToString(<CV { ...profile } />),
            })
        })
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
export default function (_app) {
    app = _app;
    app.use(router.routes());
    app.use(router.allowedMethods());
};
