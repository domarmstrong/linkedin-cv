"use strict";

/**
 * Author: Dom Armstrong, Date: 16/08/15
 */

import React from 'react';
import { InfoPanel } from '../components/info_panel';

export default class Portfolio extends React.Component {
  render () {
    return (
      <div id="Portfolio" className="links-page">
        <h1>Portfolio</h1>
        <ul className="links">
          <InfoPanel img="/public/img/optimise-thumbnail.png" title="OPTiMiSe" href="/portfolio/optimise">
            Optimise is an Online Passenger Transport Management System designed specifically for community transport
            organisations.
           </InfoPanel>
          <InfoPanel img="/public/img/optimise-website-thumbnail.png" title="OPTiMiSe website" href="/portfolio/optimise-website">
            A responsive sales website for OPTiMiSe.
          </InfoPanel>
        </ul>
      </div>
    );
  }
}
