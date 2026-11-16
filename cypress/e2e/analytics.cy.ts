import { fireInstallPrompt, savedPreferences, visitStubbed, withPreferences } from '../support/stubs';

const CONFIG = 'window.__CONFIG__ = {"matomoUrl":"https://matomo.example.com/","matomoSiteId":"1"};\n';

const stubMatomo = () => {
  cy.intercept('GET', '/config.js', {
    statusCode: 200,
    headers: { 'content-type': 'application/javascript' },
    body: CONFIG,
  });
  cy.intercept('GET', 'https://matomo.example.com/**', { statusCode: 200, body: '' }).as('matomo');
};

const openPreferences = () => {
  cy.get('.currentTemp').should('be.visible');
  cy.get('button[aria-label="Preferences"]').click();
  cy.get('dialog.prefsPanel').should('have.attr', 'open');
};

describe('Analytics prompt', () => {
  it('stays hidden when Matomo is not configured', () => {
    cy.intercept('GET', '/config.js', { statusCode: 404, body: '' });
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');
    openPreferences();
    cy.contains('Share anonymous usage').should('not.exist');
  });

  it('asks once, and a no leaves only the preferences switch', () => {
    stubMatomo();
    visitStubbed();
    cy.get('aside[aria-label="Share anonymous usage"]').should('be.visible');
    cy.contains('button', 'No thanks').click();
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');
    cy.get('script[data-matomo]').should('not.exist');
    savedPreferences().should((prefs) => {
      expect(prefs.analytics).to.eq(false);
      expect(prefs.analyticsAsked).to.eq(true);
    });

    cy.reload();
    cy.get('.currentTemp').should('be.visible');
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');

    openPreferences();
    cy.contains('.prefs-toggle', 'Share anonymous usage').find('input').should('not.be.checked');
  });

  it('loads Matomo after a yes, and does not ask again', () => {
    stubMatomo();
    visitStubbed();
    cy.contains('button', 'Share').click();
    cy.get('@matomo.all').should('have.length.at.least', 1);
    savedPreferences().should((prefs) => {
      expect(prefs.analytics).to.eq(true);
      expect(prefs.analyticsAsked).to.eq(true);
    });

    cy.reload();
    cy.get('.currentTemp').should('be.visible');
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');
    cy.get('@matomo.all').should('have.length.at.least', 2);
  });

  it('shows the install sheet first, then the analytics ask', () => {
    stubMatomo();
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    cy.window().then((win) => fireInstallPrompt(win));
    cy.get('.installBanner').should('be.visible');
    cy.get('.promptStack-under').should('be.visible');
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');

    cy.get('.installBanner-dismiss').click();
    cy.get('.installBanner').should('not.exist');
    cy.get('aside[aria-label="Share anonymous usage"]').should('be.visible');
    cy.get('.promptStack-under').should('not.exist');
  });

  it('turns sharing on from preferences without another prompt', () => {
    stubMatomo();
    visitStubbed({ onBeforeLoad: withPreferences({ analyticsAsked: true, analytics: false }) });
    cy.get('.currentTemp').should('be.visible');
    cy.get('aside[aria-label="Share anonymous usage"]').should('not.exist');
    openPreferences();
    cy.contains('.prefs-toggle', 'Share anonymous usage').find('input').check();
    cy.get('@matomo.all').should('have.length.at.least', 1);
    savedPreferences().its('analytics').should('eq', true);
  });
});
