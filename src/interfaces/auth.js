"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 *
 * Defines the auth interface for use with the apps global context
 *
 * @interface auth
 */
export var auth = {
  /**
   * Is the user currently authenticated
   * For the client side this is a helper and not definitive
   * Any important authentication must be checked on the server
   * @returns {boolean}
   */
  isAuthenticated () { return true }
};
