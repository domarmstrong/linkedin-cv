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
                    <title>Dom Armstrong</title>
                </head>
                <body>
                    { this.props.children }
                </body>
            </html>
        );
    }
}
