'use strict';

const { savedPreferences, visitStubbed } = require('../support/stubs');

const withPreferences = (preferences) => (win) => {
  win.localStorage.setItem('preferences', JSON.stringify(preferences));
};

describe('Condensed view', () => {
  describe('navbar summary', () => {
    it('appears once the current conditions scroll away and returns to the top', () => {
      visitStubbed();
      cy.get('.currentTemp').should('be.visible');
      cy.get('.navSummary').should('have.attr', 'aria-hidden', 'true').and('have.css', 'opacity', '0');

      cy.get('.weeklyForecastRow').last().scrollIntoView();
      cy.get('html').should('have.class', 'hero-offscreen');
      cy.get('.navSummary').should('have.attr', 'aria-hidden', 'false');
      cy.get('.navSummary').should('have.css', 'opacity', '1');
      cy.get('.navSummary').should('contain.text', '69').and('contain.text', 'Overcast');

      cy.get('.navSummary').click();
      cy.window().its('scrollY').should('eq', 0);
      cy.get('html').should('not.have.class', 'hero-offscreen');
      cy.get('.navSummary').should('have.attr', 'aria-hidden', 'true');
    });

    it('also appears on scroll in the compact layout', () => {
      visitStubbed({ onBeforeLoad: withPreferences({ layout: 'compact' }) });
      cy.get('.currentTemp').should('be.visible');
      cy.get('.navSummary').should('have.attr', 'aria-hidden', 'true');
      cy.get('.weeklyForecastRow').last().scrollIntoView();
      cy.get('.navSummary').should('have.attr', 'aria-hidden', 'false');
      cy.get('.navSummary').should('have.css', 'opacity', '1');
      cy.get('.navSummary').should('contain.text', '69');
    });

    it('fits on one row on phones', () => {
      cy.viewport(390, 844);
      visitStubbed();
      cy.get('.currentTemp').should('be.visible');
      cy.get('.weeklyForecastRow').last().scrollIntoView();
      cy.get('.navSummary').should('have.css', 'opacity', '1');
      cy.get('.app-brand-links').should('not.be.visible');
      cy.get('.navbar-toggler').then(($toggle) => {
        cy.get('.navSummary').should(($summary) => {
          const toggle = $toggle[0].getBoundingClientRect();
          const summary = $summary[0].getBoundingClientRect();
          expect(Math.abs(toggle.top + toggle.height / 2 - (summary.top + summary.height / 2))).to.be.lessThan(4);
        });
      });
    });
  });

  describe('compact layout', () => {
    it('tightens the current conditions when turned on', () => {
      visitStubbed();
      cy.get('.currentDescription').should('have.text', 'Overcast.');
      cy.get('.currentHero').invoke('outerHeight').then((comfortable) => {
        cy.get('button[aria-label="Preferences"]').click();
        cy.contains('.prefs-field', 'Compact layout').contains('label', 'On').click();
        cy.get('.prefsPanel-close').click();

        cy.get('html').should('have.class', 'compact');
        cy.get('.currentHero').invoke('outerHeight').should('be.lessThan', comfortable);
        cy.get('.currentDescription').should('not.exist');
        cy.get('.currentMeta-description').should('have.text', 'Overcast.');
      });
      savedPreferences().its('layout').should('eq', 'compact');

      cy.reload();
      cy.get('.currentTemp').should('be.visible');
      cy.get('html').should('have.class', 'compact');
    });

    it('keeps the 24-hour strip aligned with the week', () => {
      visitStubbed({ onBeforeLoad: withPreferences({ layout: 'compact' }) });
      cy.get('.dailyOverview').then(($strip) => {
        cy.get('.weeklyForecast').invoke('width').should('be.closeTo', $strip.width(), 24);
      });
    });

    it('is compact on phones by default', () => {
      cy.viewport(390, 844);
      visitStubbed();
      cy.get('.currentTemp').should('be.visible');
      cy.get('html').should('have.class', 'compact');
      cy.get('.currentMeta-description').should('exist');
    });

    it('is comfortable on desktop by default', () => {
      visitStubbed();
      cy.get('.currentTemp').should('be.visible');
      cy.get('html').should('not.have.class', 'compact');
    });

    it('can be turned off on phones', () => {
      cy.viewport(390, 844);
      visitStubbed({ onBeforeLoad: withPreferences({ layout: 'comfortable' }) });
      cy.get('.currentTemp').should('be.visible');
      cy.get('html').should('not.have.class', 'compact');
      cy.get('.currentDescription').should('exist');
    });
  });
});
