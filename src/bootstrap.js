import React from 'react';
import { App } from './views/app';

window.React = React;

React.render(React.createElement(App), document.querySelector('#app'));
