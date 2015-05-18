"use strict";

import koaRouter from 'koa-router';
import queryString from 'query-string';
import { linkedIn } from './auth';
import Q from 'q';

const router = koaRouter();

router.get('/', function *(next) {
    Q.try(() => {
        return linkedIn.getProfile(this);
    }).then(auth => {
        console.log('got auth', auth);
    }).catch(err => {
        console.log('err', err.stack);
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
