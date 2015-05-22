"use strict";
/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';

export class Login extends React.Component {
  render () {
    let { username, validation } = this.props;

    return (
      <div className="login">
        <div className="spacer" />
        <div className="login-container">
          <form className="pure-form pure-form-stacked" action="/login" method="POST">
            <fieldset>
              <legend>Sign in</legend>

              { validation.login && <div className="form-validation">{ validation.login }</div> }

              <label htmlFor="username">Username</label>
              <input name="username" type="text" placeholder="Username" value={ username } />

              <label htmlFor="password">Password</label>
              <input name="password" type="password" placeholder="Password" />

              <button type="submit">Sign in</button>
            </fieldset>
          </form>
        </div>
      </div>
    )
  }
}
Login.propTypes = {
  username: React.PropTypes.string,
  validation: React.PropTypes.object,
};
Login.defaultProps = {
  username: '',
  validation: {},
};
