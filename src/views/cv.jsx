"use strict";
/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

import React from 'react';

/**
 * Take a string that is broken by \n chars and return an array of <p> elements.
 * multiple \n characters are ignored
 * @param str
 * @return {Array} <p> elements
 */
function formatParas(str) {
    return str.split('\n')
        .filter(para => !!para)
        .map((para, i) => <p key={ i }>{ para }</p>);
}

export class CV extends React.Component {
    render () {
        let { props } = this;
        console.log(props);

        return (
            <div className="cv">
                <section className="about">
                    <div className="profile-pic">
                        <img className="profile-img" src={ props.imagePath } />
                    </div>

                    <div className="details">
                        <header>
                            <h1 className="name">{ props.firstName } { props.lastName }</h1>
                            <h2 className="headline">{ props.headline }</h2>
                        </header>

                        <section className="contact">
                            <div className="entry">
                                <span className="label">Location</span>
                                <span className="value">{ props.location }</span>
                            </div>
                            <div className="entry">
                                <span className="label">Industry</span>
                                <span className="value">{ props.industry }</span>
                            </div>
                            <div className="entry">
                                <span className="label">Email</span>
                                <span className="value">{ props.email }</span>
                            </div>
                            <div className="entry">
                                <span className="label">Phone</span>
                                <span className="value">{ props.phone }</span>
                            </div>
                            <div className="entry">
                                <span className="label">LinkedIn</span>
                                <span className="value">
                                    <a className="linkedIn-link" href={ props.publicProfileUrl } target="_blank">LinkedIn profile</a>
                                </span>
                            </div>
                        </section>
                    </div>
                </section>

                <section className="background">
                    <h1>Background</h1>

                    <section>
                        <h2>Summary</h2>
                        { formatParas(props.summary) }

                        { props.specialties && (
                            formatParas(props.specialties)
                        )}
                    </section>

                    { props.positions.length > 0 && (
                        <section>
                            <hr/>

                            <h2>Experience</h2>
                            { props.positions.map(position => {
                                return <Position { ...position } />;
                            }) }
                        </section>
                    )}

                    { props.skills.length > 0 && (
                        <section>
                            <hr/>

                            <h2>Skills</h2>
                            { props.skills.map(skill => {
                                return <Skill key={ skill.id } { ...skill } />;
                            }) }
                        </section>
                    )}

                    { props.educations.length > 0 && (
                        <section>
                            <hr/>

                            <h2>Education</h2>
                            { props.educations.map(education => {
                                return <Education key={ education.id } { ...education } />
                            }) }
                        </section>
                    )}
                </section>
            </div>
        )
    }
}
CV.propTypes = {
    imagePath: React.PropTypes.string.isRequired,
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
    headline: React.PropTypes.string,
    location: React.PropTypes.string,
    industry: React.PropTypes.string,
    email: React.PropTypes.string,
    phone: React.PropTypes.string,
    summary: React.PropTypes.string,
    specialities: React.PropTypes.string,
    skills: React.PropTypes.array,
    positions: React.PropTypes.array,
    educations: React.PropTypes.array,
};

class Skill extends React.Component {
    render () {
        let { props } = this;
        return (
            <div key={ props.id } className="skill">
                { JSON.stringify(props) }
            </div>
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
        const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        let { id, title, company, startDate, endDate, summary } = this.props;
        return (
            <div key={ id } className="position">
                <header>
                    <h1>{ title }</h1>
                    <h2>{ company.name }</h2>
                </header>

                <div className="dates">
                    <span>{ MONTHS[startDate.month - 1] } { startDate.year } &ndash; </span>
                    { endDate ? (
                        <span>{ MONTHS[endDate.month - 1] } { endDate.year }</span>
                    ) : (
                        <span>Present</span>
                    )}
                    <span> { this.getTimeSpent() }</span>
                </div>
                { formatParas(summary) }
            </div>
        );
    }
}

class Education extends React.Component {
    render () {
        let { props } = this;
        return (
            <div key={ props.id } className="education">
                { JSON.stringify(props) }
            </div>
        );
    }
}
