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
export function formatParas(str) {
  if (typeof str !== 'string') return str;
  return str.split('\n')
    .filter(para => !!para)
    .map((para, i) => <p key={ i }>{ para }</p>);
}

export default class CV extends React.Component {

  static fetchProps () {
    return request.get('/api/profile').then(res => res.body);
  }

  render () {
    let props = this.props;

    return (
      <div id="cv" className="single-col">
        <section className="cv-section about">
          <div className="profile-pic">
            <img className="profile-img" src={ props.imagePath } />
          </div>

          <div className="details">
            <header>
              <h1 className="name">{ props.firstName } { props.lastName }</h1>
              <h2 className="headline">{ props.headline }</h2>
            </header>

            <section className="info">
              <div className="entry location">
                <span className="label">Location</span>
                <span className="value">{ props.location }</span>
                <div className="map-container">
                  <div id="map-canvas" />
                </div>
              </div>
              <div className="entry">
                <span className="label">Industry</span>
                <span className="value">{ props.industry }</span>
              </div>
            </section>

            <section className="contact">
              <div className="entry">
                <span className="label">Email</span>
                <span className="value">
                  <i className="icon-email" />
                  <a href={ "mailto:" + props.email } target="_blank">{ props.email }</a>
                </span>
              </div>
              <div className="entry">
                <span className="label">Phone</span>
                <span className="value"><i className="icon-phone" />{ props.phone }</span>
              </div>
              <div className="entry">
                <span className="label">LinkedIn</span>
                <span className="value">
                  <i className="icon-in" />
                  <a className="linkedIn-link" href={ props.publicProfileUrl } target="_blank">LinkedIn profile</a>
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
            { formatParas(props.summary) }

            { props.specialties && (
              formatParas(props.specialties)
            )}
          </section>

          { props.positions.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-experience" />
                <h2>Experience</h2>
              </header>

              { props.positions.map(position => {
                return <Position key={ position.id } { ...position } />;
              }) }
            </section>
          )}

          { props.skills.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-error" />
                <h2>skills</h2>
              </header>

              { props.skills.map(skill => {
                return <Skill key={ skill.id } { ...skill } />;
              }) }
            </section>
          )}

          { props.educations.length > 0 && (
            <section>
              <hr/>

              <header>
                <i className="icon-error" />
                <h2>Education</h2>
              </header>

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
  firstName: React.PropTypes.string.isRequired,
  lastName: React.PropTypes.string.isRequired,
  headline: React.PropTypes.string.isRequired,
  location: React.PropTypes.string.isRequired,
  industry: React.PropTypes.string.isRequired,
  email: React.PropTypes.string,
  publicProfile: React.PropTypes.string,
  summary: React.PropTypes.string.isRequired,
  specialties: React.PropTypes.string,
  positions: React.PropTypes.array.isRequired,
  skills: React.PropTypes.array.isRequired,
  educations: React.PropTypes.array.isRequired,
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

export class Position extends React.Component {
  static getTimeSpent (startDate, endDate) {
    if (! endDate) {
      let now = new Date();
      endDate = {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }
    }
    let years = endDate.year - startDate.year;
    let months = endDate.month - startDate.month;

    function plural(str, n) {
      return str + (n > 1 ? 's' : '');
    }
    let time = [];
    if (years) {
      time.push(`${ years } ${ plural('year', years) }`);
    }
    if (months) {
      time.push(`${ months } ${ plural('month', months)}`);
    }
    if (! (years || months)) {
      time.push('1 month');
    }
    return time.join(' ');
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
            <span> ({ Position.getTimeSpent(startDate, endDate) })</span>
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
