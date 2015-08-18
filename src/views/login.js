"use strict";

/**
 * Author: Dom Armstrong, Date: 21/05/15
 */

import React from 'react';
import autobind from 'autobind-decorator';
import request from '../request';
import { getClient } from '../client/client';

let client = getClient();

export default class Login extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      username: props.username || '',
      password: '',
      validation: props.validation || {},
    };
  }

  @autobind
  handleUsername (event) {
    let target = event.target || event.currentTarget;
    this.setState({ username: target.value });
  }

  @autobind
  handlePassword (event) {
    let target = event.target || event.currentTarget;
    this.setState({ password: target.value });
  }

  submit (username, password) {
    return client.login(username, password).then(() => {
      let query = this.props.routerState.location.query;
      let page = '/admin'; // default page after login TODO: where should this be defined
      if (query && query.then) page = query.then;
      this.context.router.transitionTo(page);
    }).catch(err => {
      this.setState({ validation: { login: err.message }});
    });
  }

  @autobind
  handleSubmit (event) {
    this.submit(this.state.username, this.state.password);
    event.stopPropagation();
    event.preventDefault();
  }

  render () {
    let { username, password, validation } = this.state;

    return (
      <div className="login">
        <div className="spacer" />
        <div className="login-container">
          <form className="pure-form pure-form-stacked" action="/auth/login" method="POST">
            <fieldset>
              <legend>Sign in</legend>

              { validation.login && <div className="form-validation">{ validation.login }</div> }

              <label htmlFor="username">Username</label>
              <input ref="username" name="username" type="text" placeholder="Username" value={ username } onChange={ this.handleUsername }/>

              <label htmlFor="password">Password</label>
              <input ref="password" name="password" type="password" placeholder="Password" value={ password } onChange={ this.handlePassword } />

              <button ref="submit" type="submit" onClick={ this.handleSubmit }>Sign in</button>
            </fieldset>
          </form>
        </div>
      </div>
    )
  }
}
Login.contextTypes = {
  router: React.PropTypes.any,
};
Login.propTypes = {
  username: React.PropTypes.string,
  validation: React.PropTypes.object,
};
Login.defaultProps = {
  username: '',
  validation: {},
};
