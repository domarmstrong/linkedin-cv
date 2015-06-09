"use strict";

/**
 * Author: Dom Armstrong, Date: 05/06/15
 */

import Router from 'react-router';
import routes, { fetchHandlerData } from '../app-routes';
import { ContextWrapper } from '../components/context_wrapper';

export default {
  init () {
    return new Promise((resolve, reject) => {
      console.log('Initialize router');
      let router = Router.create({
        location: Router.HistoryLocation,
        routes: routes,
      });
      router.run((Handler, state) => {
        return fetchHandlerData(state).then(routeData => {
          // context.routeData will be available to all components
          let context = { routeData };
          // Props for top level app component
          let props = { app_name: window.app_name };

          React.render(
            <ContextWrapper component={ Handler } props={ props } context={ context } />,
            document.querySelector('#_mount')
          );
        })
      });
    });
  },
}

