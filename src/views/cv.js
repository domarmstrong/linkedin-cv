"use strict";

/**
 * Author: Dom Armstrong, Date: 18/05/15
 */

import React from 'react';
import request from '../request';

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

export default class CV extends React.Component {

  static fetchData () {
    return request.get('/api/profile').then(res => ({ cvProfile: res.body }));
  }

  render () {
    let profile = this.context.routeData.cvProfile;

    return (
      <div id="cv" className="single-col">
        <section className="cv-section about">
          <div className="profile-pic">
            <img className="profile-img" src={ profile.imagePath } />
          </div>

          <div className="details">
            <header>
              <h1 className="name">{ profile.firstName } { profile.lastName }</h1>
              <h2 className="headline">{ profile.headline }</h2>
            </header>

            <section className="info">
              <div className="entry location">
                <span className="label">Location</span>
                <span className="value">{ profile.location }</span>
                <div className="map-container">
                  <div id="map-canvas" />
                </div>
              </div>
              <div className="entry">
                <span className="label">Industry</span>
                <span className="value">{ profile.industry }</span>
              </div>
            </section>

            <section className="contact">
              <div className="entry">
                <span className="label">Email</span>
                <span className="value">
                  <i className="icon-email" />
                  <a href={ "mailto:" + profile.email } target="_blank">{ profile.email }</a>
                </span>
              </div>
              <div className="entry">
                <span className="label">Phone</span>
                <span className="value"><i className="icon-phone" />{ profile.phone }</span>
              </div>
              <div className="entry">
                <span className="label">LinkedIn</span>
                <span className="value">
                  <i className="icon-in" />
                  <a className="linkedIn-link" href={ profile.publicProfileUrl } target="_blank">LinkedIn profile</a>
                </span>
              </div>
            </section>
          </div>
        </section>

        <section className="cv-section background">
          <h1>Background</h1>

          <section>
            <header>
              <i className="icon-profile" />
              <h2>Summary</h2>
            </header>
            { formatParas(profile.summary) }

            { profile.specialties && (
              formatParas(profile.specialties)
            )}
          </section>

          { profile.positions.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-experience" />
                <h2>Experience</h2>
              </header>

              { profile.positions.map(position => {
                return <Position key={ position.id } { ...position } />;
              }) }
            </section>
          )}

          { profile.skills.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-error" />
                <h2>skills</h2>
              </header>

              { profile.skills.map(skill => {
                return <Skill key={ skill.id } { ...skill } />;
              }) }
            </section>
          )}

          { profile.educations.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-error" />
                <h2>Education</h2>
              </header>

              { profile.educations.map(education => {
                return <Education key={ education.id } { ...education } />
              }) }
            </section>
          )}
        </section>
      </div>
    )
  }
}
CV.contextTypes = {
  routeData: React.PropTypes.object.isRequired,
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
          <h3>{ title }</h3>
          <div className="sub">{ company.name }</div>
          <div className="dates">
            <span>{ MONTHS[startDate.month - 1] } { startDate.year } &ndash; </span>
            { endDate ? (
              <span>{ MONTHS[endDate.month - 1] } { endDate.year }</span>
            ) : (
              <span>Present</span>
            )}
            <span> { this.getTimeSpent() }</span>
          </div>
        </header>

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
