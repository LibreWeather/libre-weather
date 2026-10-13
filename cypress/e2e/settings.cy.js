'use strict';

const { REVERSE, expectRequest, visitStubbed } = require('../support/stubs');

const weatherFor = (pattern) => expectRequest('weather', ({ url }) => pattern.test(url), `weather request ${pattern}`);
const geocodeFor = (zip) =>
  expectRequest('geocode', ({ query }) => query.postalcode === zip, `geocode request for ${zip}`);

describe('Settings bar', () => {
  it('exposes location controls and a preferences button', () => {
    visitStubbed();
    cy.get('#locationName').should('have.text', 'Kansas City');
    cy.get('input[aria-label="ZIP Code"]').should('exist');
    cy.get('button[aria-label="Preferences"]').should('be.visible');
  });

  describe('location', () => {
    it('looks up a ZIP code and loads its weather', () => {
      visitStubbed();
      cy.get('#locationName').should('have.text', 'Kansas City');
      cy.get('input[aria-label="ZIP Code"]').type('90210');
      cy.get('.app-settings-location button[type="submit"]').click();
      geocodeFor('90210');
      cy.get('#locationName').should('have.text', 'Beverly Hills');
      weatherFor(/\/34\.0901,-118\.4065\/unit\/IMPERIAL$/);
      cy.window().its('localStorage').invoke('getItem', 'zip').should('eq', '90210');
    });

    it('lets the user pick between multiple matches for a ZIP code', () => {
      visitStubbed();
      cy.get('#locationName').should('have.text', 'Kansas City');
      cy.get('input[aria-label="ZIP Code"]').type('12345');
      cy.get('.app-settings-location button[type="submit"]').click();
      geocodeFor('12345');
      cy.get('#location-options').should('be.visible');
      cy.get('.dropdown-item').should('have.length', 2);
      cy.contains('.dropdown-item', 'Rotterdam, USA').click();
      cy.get('#locationName').should('have.text', 'Rotterdam');
      weatherFor(/\/42\.8,-73\.9\/unit\/IMPERIAL$/);
      cy.get('#location-options').should('not.exist');
    });

    it('uses the device location and can switch back to the ZIP code', () => {
      visitStubbed({
        onBeforeLoad(win) {
          cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((ok) =>
            ok({ coords: { latitude: Number(REVERSE.lat), longitude: Number(REVERSE.lon) } })
          );
        },
      });
      cy.get('#locationName').should('have.text', 'Kansas City');
      cy.get('.app-settings-location .input-group button').first().as('geo').click();
      cy.get('@geo').should('have.class', 'active');
      expectRequest('reverse', ({ query }) => query.lat === REVERSE.lat && query.lon === '-74.006');
      cy.get('#locationName').should('have.text', 'Geoville');
      weatherFor(/\/40\.7128,-74\.006\/unit\/IMPERIAL$/);
      cy.window().its('localStorage').invoke('getItem', 'useGeo').should('eq', 'true');

      cy.get('@geo').click();
      cy.get('@geo').should('not.have.class', 'active');
      geocodeFor('10001');
      cy.get('#locationName').should('have.text', 'New York');
    });
  });
});
