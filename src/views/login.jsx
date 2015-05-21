"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export class Login extends React.Component {
    render () {
        let { props } = this;

        return (
            <div className="login">
                <div className="spacer" />
                <div className="login-container">
                    <form className="pure-form pure-form-stacked" action="/login">
                        <fieldset>
                            <legend>Sign in</legend>

                            <label>Username</label>
                            <input type="text" placeholder="Username" />

                            <label>Password</label>
                            <input type="password" placeholder="Password" />

                            <button type="submit" className="pure-button pure-button-primary">Sign in</button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}
