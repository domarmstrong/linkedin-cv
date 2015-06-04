"use strict";

/**
 * Author: Dom Armstrong, Date: 03/06/15
 *
 * Use react router to serve the application views
 *
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

import Router from 'react-router';
import routes from '../app-routes';
import { render } from './renderer';
import Pomise from 'bluebird';
import config from '../../config';
import _ from 'underscore';

export default {
  middleware () {
    return function *(next) {
      let router = Router.create({ location: this.req.url, routes: routes });

      // Start the router but return a promise
      function routerAsPromised () {
        return new Promise(resolve => {
            router.run((Handler, state) => resolve([ Handler, state ]));
        });
      }

      this.body = yield routerAsPromised().then(([ Handler, state ]) => {
        // If a route handler has a static fetchData method call it and pass in router state
        // fetchData should return an object with a namespace to retrieve the data
        // See example below
        let props = {
          app_name: config.app_name,
        };
        // context.routeData will be available to all components
        let context = {
          routeData: {
            // namedData: data
          },
        };
        function extendContext (data) {
          Object.keys(data).forEach(key => {
            if (key in context.routeData) throw new Error('Name conflict for data: ' + key);
            context.routeData[key] = data[key];
          });
        }
        return Promise.all(
          state.routes
            .filter(route => route.handler.fetchData)
            .map(route => Pomise.resolve(route.handler.fetchData(state))
                .then(d => extendContext(d))
                .catch(err => console.error('ERROR: blah')) // TODO error logging
            )
        ).then(() => render(Handler, props, context));
      });
    }
  }
}

