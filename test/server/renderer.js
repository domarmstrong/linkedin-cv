"use strict";

import { assert } from 'chai';
import { render } from '../../src/server/renderer';
import React from 'react';


describe('renderer', () => {
  it('renders a component into the #_mount div', () => {
    class It extends React.Component {
      render = () => <div>foo</div>
    }
    let str = render(<It />);
    assert.match(str, /<div id="_mount"><div.*?>foo<\/div><\/div>/);
  });
});
