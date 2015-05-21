"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export class Admin extends React.Component {
    render () {
        return (
            <div className="admin">
                Admin
                <form className="pure-form" action="/admin/update" method="GET">
                    <button type="submit" className="pure-button pure-button-primary">Update profile</button>
                </form>
            </div>
        )
    }
}
