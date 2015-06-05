"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import Router from 'react-router';
import routes from '../app-routes';

export default {

}

function handleRoute (req, url) {
  return new Promise((resolve, reject) => {
    let router = Router.create({
      location: url,
      routes: routes,
      onError: err => reject(err),
      onAbort: info => reject(info)
    });
    router.run((Handler, state) => {
      let auth = createAuth(req);
      resolve(renderHandler(Handler, state, auth))
    });
  }).catch(err => {
      if (err.constructor.name === 'Redirect') {
        let query = queryString.stringify(err.query);
        let path = [ err.to ];
        if (query) path.push(query);
        path = path.join('?');
        req.redirect(path);
        return handleRoute(path);
      }
      throw err;
    });
}

function renderHandler (Handler, state, auth) {
  return fetchHandlerData(state).then(routeData => {
    // context.routeData will be available to all components
    let context = { routeData, auth };
    // Props for top level app component
    let props = { app_name: config.app_name };
    return render(Handler, props, context);
  })
}

/**
 * Before a route is rendered all handler components will be checked for a `fetchData` static method
 *
 * @example:
 *
 * class Component {
 *   static fetchData () {
 *     // mynamespace should be unique to this component, error will be thrown on name clash
 *     return APromiseFor > { mynamespace: mydata }
 *   }
 *
 *   render () {
 *     let mydata = this.context.routeData.mynamespace;
 *   }
 * }
 * Component.context = {
 *   routeData: React.PropTypes.object,
 * }
 */
function fetchHandlerData (state) {
  let routeData = {};

  function extend (data) {
    Object.keys(data).forEach(key => {
      if (key in routeData) throw new Error('Name conflict for data: ' + key);
      routeData[key] = data[key];
    });
  }

  return Promise.all(
    state.routes
      .filter(route => route.handler.fetchData)
      .map(route => Promise.resolve(route.handler.fetchData(state))
        .then(extend)
        .catch(err => console.error('ERROR: blah')) // TODO error logging
    )
  ).then(() => routeData);
}
