"use strict";
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

import React from 'react';

export class HTML extends React.Component {
    render () {
        return (
            <html lang="en">
                <head>
                    <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                    <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.6.0/pure-min.css" />
                    <link rel="stylesheet" href="/public/main.css" type="text/css" />
                    <title>Dom Armstrong</title>
                </head>
                <body>
                    { this.props.children }
                </body>
            </html>
        );
    }
}
