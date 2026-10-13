'use strict';

const { HOUR, fixedNow, visitStubbed } = require('../support/stubs');

const alert = (overrides = {}) => {
  const now = fixedNow();
  return {
    id: 'urn:oid:1',
    source: 'NWS',
    event: 'Wind Advisory',
    headline: 'Wind Advisory issued by NWS Kansas City',
    description: 'Southwest winds 20 to 30 mph with gusts up to 50 mph.',
    instruction: 'Secure outdoor objects.',
    severity: 'MODERATE',
    urgency: 'Expected',
    certainty: 'Likely',
    onset: now - HOUR,
    expires: now + 3 * HOUR,
    ends: now + 6 * HOUR,
    sender: 'NWS Kansas City/Pleasant Hill MO',
    areas: 'Jackson, MO',
    url: 'https://api.weather.gov/alerts/urn:oid:1',
    ...overrides,
  };
};

const reply = (alerts, extra = {}) => ({ coverage: true, sources: ['NWS'], alerts, ...extra });

describe('Weather alerts', () => {
  it('asks for alerts at the resolved location', () => {
    visitStubbed();
    cy.wait('@alerts').its('request.url').should('match', /\/alerts\/39\.1031,-94\.5822$/);
  });

  it('lists active alerts in the order the API ranks them', () => {
    visitStubbed({
      alerts: reply([
        alert({ id: 'tor', event: 'Tornado Warning', severity: 'EXTREME' }),
        alert({ id: 'wind' }),
      ]),
    });
    cy.get('.weatherAlerts').should('have.attr', 'aria-label', '2 active weather alerts');
    cy.get('.weatherAlert').should('have.length', 2);
    cy.get('.weatherAlert').first().should('have.class', 'severity-extreme').and('contain.text', 'Tornado Warning');
    cy.get('.weatherAlert').eq(1).should('have.class', 'severity-moderate').and('contain.text', 'until');
  });

  it('expands an alert to show what to do and who issued it', () => {
    visitStubbed({ alerts: reply([alert()]) });
    cy.get('.weatherAlert-body').should('not.be.visible');
    cy.contains('.weatherAlert-summary', 'Wind Advisory').click();
    cy.get('.weatherAlert').should('have.attr', 'open');
    cy.get('.weatherAlert-body')
      .should('be.visible')
      .and('contain.text', 'gusts up to 50 mph')
      .and('contain.text', 'What to do')
      .and('contain.text', 'Secure outdoor objects.')
      .and('contain.text', 'Jackson, MO')
      .and('contain.text', 'National Weather Service');
    cy.contains('.weatherAlert-body a', 'Full alert').should('have.attr', 'href', 'https://api.weather.gov/alerts/urn:oid:1');
  });

  it('notes when an alert has not started yet', () => {
    visitStubbed({ alerts: reply([alert({ onset: fixedNow() + 2 * HOUR })]) });
    cy.contains('.weatherAlert-summary', 'Wind Advisory').click();
    cy.get('.weatherAlert-body').should('contain.text', 'Starts');
  });

  it('hides alerts that have already expired', () => {
    visitStubbed({ alerts: reply([alert({ expires: fixedNow() - HOUR })]) });
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
  });

  it('stays out of the way when there are no alerts', () => {
    visitStubbed();
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
    cy.get('.alertsCoverageNote').should('not.exist');
  });

  it('says so when no provider covers the area, rather than implying an all-clear', () => {
    visitStubbed({ alerts: { coverage: false, sources: [], alerts: [] } });
    cy.get('.alertsCoverageNote').should('contain.text', 'aren\'t available for this area');
  });

  it('keeps the forecast working when the alerts request fails', () => {
    visitStubbed({ alerts: { statusCode: 502, body: { error: 'down' } } });
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
    cy.get('.weatherError').should('not.exist');
  });

  it('shows alerts even before the forecast has loaded', () => {
    visitStubbed({ weatherDelay: 1500, alerts: reply([alert({ event: 'Flood Warning', severity: 'SEVERE' })]) });
    cy.get('.weatherSkeleton').should('be.visible');
    cy.contains('.weatherAlert', 'Flood Warning').should('be.visible');
  });
});
