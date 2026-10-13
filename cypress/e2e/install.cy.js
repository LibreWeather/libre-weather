'use strict';

const { savedPreferences, visitStubbed } = require('../support/stubs');

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Fires a fake Chromium `beforeinstallprompt` and returns its `prompt` stub. */
const offerInstall = (outcome = 'accepted') =>
  cy.window().then((win) => {
    const event = new win.Event('beforeinstallprompt', { cancelable: true });
    event.prompt = cy.stub().as('prompt').resolves();
    event.userChoice = Promise.resolve({ outcome });
    win.dispatchEvent(event);
  });

describe('Install banner', () => {
  it('stays hidden until the browser says the app is installable', () => {
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    cy.get('.installBanner').should('not.exist');
  });

  it('opens the native install prompt and goes away once installed', () => {
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    offerInstall('accepted');
    cy.get('.installBanner').should('be.visible').and('contain.text', 'Install Libre Weather');
    cy.contains('.installBanner button', 'Install').click();
    cy.get('@prompt').should('have.been.calledOnce');
    cy.get('.installBanner').should('not.exist');
    savedPreferences().its('installBannerDismissed').should('eq', true);
  });

  it('remembers a dismissal in localStorage without setting cookies', () => {
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    offerInstall();
    cy.get('.installBanner-dismiss').click();
    cy.get('.installBanner').should('not.exist');
    savedPreferences().its('installBannerDismissed').should('eq', true);
    cy.document().its('cookie').should('eq', '');

    cy.reload();
    cy.get('.currentTemp').should('be.visible');
    offerInstall();
    cy.get('.installBanner').should('not.exist');
  });

  it('explains Add to Home Screen on iOS, where there is no install prompt', () => {
    visitStubbed({
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'userAgent', { value: IPHONE_UA });
      },
    });
    cy.get('.installBanner').should('be.visible').and('contain.text', 'Add to Home Screen');
    cy.contains('.installBanner button', 'Install').should('not.exist');
  });
});
