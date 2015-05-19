"use strict";
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

import React from 'react';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export class CV extends React.Component {
    render () {
        let { props } = this;
        console.log(props);

        return (
            <div className="cv">
                <div className="wrapper">
                    <section className="about">
                        <h1 className="name">{ props.firstName } { props.lastName }</h1>
                        <div className="headline">{ props.headline }</div>
                        <div className="location">{ props.location }</div>
                        <div className="industry">{ props.industry }</div>

                        <img className="profile-image" src={ props.imagePath } />

                        <div className="contact">
                            <div className="entry">
                                <span className="label">Email</span>
                                <span className="value">{ props.email }</span>
                            </div>
                            <div className="entry">
                                <span className="label">Phone</span>
                                <span className="value">{ props.phone }</span>
                            </div>
                        </div>

                        <a href={ props.publicProfileUrl } target="_blank">LinkedIn</a>
                    </section>

                    <section className="background">
                        <h2>Background</h2>

                        <section>
                            <h3>Summary</h3>
                            <p className="summary">{ props.summary }</p>

                            { props.specialties && (
                                <p>Specialities:  { props.specialties }</p>
                            )}
                        </section>

                        { props.positions.length > 0 && (
                            <section>
                                <hr/>

                                <h3>Experience</h3>
                                { props.positions.map(position => {
                                    return <Position { ...position } />;
                                }) }
                            </section>
                        )}

                        { props.skills.length > 0 && (
                            <section>
                                <hr/>

                                <h3>Skills</h3>
                                { props.skills.map(skill => {
                                    return <Skill key={ skill.id } { ...skill } />;
                                }) }
                            </section>
                        )}

                        { props.educations.length > 0 && (
                            <section>
                                <hr/>

                                <h3>Education</h3>
                                { props.educations.map(education => {
                                    return <Education key={ education.id } { ...education } />
                                }) }
                            </section>
                        )}
                    </section>
                </div>
            </div>
        )
    }
}
CV.propTypes = {
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
    location: React.PropTypes.string,
    headline: React.PropTypes.string,
    summary: React.PropTypes.string,
    imagePath: React.PropTypes.string,
    specialities: React.PropTypes.string,
    skills: React.PropTypes.array,
    positions: React.PropTypes.array,
    educations: React.PropTypes.array,
};

class Skill extends React.Component {
    render () {
        let { props } = this;
        return (
            <section key={ props.id } className="skill">
                { JSON.stringify(props) }
            </section>
        );
    }
}

class Position extends React.Component {
    getTimeSpent () {
        let { startDate, endDate } = this.props;
        if (! endDate) {
            let now = new Date();
            endDate = {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
            }
        }
        let years = endDate.years - startDate.years;
        let months = endDate.months - startDate.months;

        function plural(str, n) {
            return str + (years > 1 ? 's' : '');
        }
        let time = [];
        if (years) {
            time.push(`${ years } ${ plural('years', years) }`);
        }
        if (months) {
            time.push(`${ months } ${ plural('months', months)}`);
        }
        if (! (years || months)) {
            time.push('1 month');
        }
        return '(' + time.join(' ') + ')';
    }

    render () {
        let { id, title, company, startDate, endDate, summary } = this.props;
        return (
            <section key={ id } className="position">
                <h1>{ title }</h1>
                <h2>{ company.name }</h2>
                <div className="dates">
                    <span>{ months[startDate.month - 1] } { startDate.year } &ndash; </span>
                    { endDate ? (
                        <span>{ months[endDate.month - 1] } { endDate.year }</span>
                    ) : (
                        <span>Present</span>
                    )}
                    <span> { this.getTimeSpent() }</span>
                </div>
                <p>{ summary }</p>

                { JSON.stringify(this.props) }
            </section>
        );
    }
}

class Education extends React.Component {
    render () {
        let { props } = this;
        return (
            <section key={ props.id } className="education">
                { JSON.stringify(props) }
            </section>
        );
    }
}
