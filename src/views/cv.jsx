"use strict";
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

import React from 'react';

export class CV extends React.Component {
    render () {
        console.log(this.props);

        return (
            <div className='cv'>
                <div className="name">{ this.props.firstName } { this.props.lastName }</div>
                <img src={ this.props.pictureUrl } />
                <div className="summary">{ this.props.summary }</div>

                { this.props.skills.map(skill => {
                    return <Skill key={ skill.id } { ...skill } />;
                }) }

                { this.props.positions.values.map(position => {
                    return <Position { ...position } />;
                }) }
            </div>
        )
    }
}
CV.defaultProps = {
    firstName: null,
    lastName: null,
    pictureUrl: null,
    skills: [],
    positions: [],
};

class Skill extends React.Component {
    render () {
        return (
            <div>
                { JSON.stringify(this.props) }
            </div>
        );
    }
}

class Position extends React.Component {
    render () {
        return (
            <div>
                { JSON.stringify(this.props) }
            </div>
        );
    }
}
