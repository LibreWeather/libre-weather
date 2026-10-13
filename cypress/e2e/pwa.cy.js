'use strict';

const { visitStubbed } = require('../support/stubs');

const manifestHref = () => cy.get('link[rel="manifest"]').invoke('attr', 'href');

describe('Progressive web app', () => {
  beforeEach(() => {
    visitStubbed();
  });

  it('links an installable web app manifest', () => {
    manifestHref().then((href) => {
      cy.request(href).then(({ status, body }) => {
        const manifest = typeof body === 'string' ? JSON.parse(body) : body;
        expect(status).to.eq(200);
        expect(manifest).to.include({
          name: 'Libre Weather',
          short_name: 'Libre Weather',
          start_url: '/',
          scope: '/',
          display: 'standalone',
        });
        expect(manifest.theme_color).to.match(/^#[0-9a-f]{6}$/i);
        expect(manifest.background_color).to.match(/^#[0-9a-f]{6}$/i);

        const has = (sizes, purpose) => manifest.icons.some((icon) => icon.sizes === sizes && icon.purpose === purpose);
        expect(has('192x192', 'any'), '192px icon').to.be.true;
        expect(has('512x512', 'any'), '512px icon').to.be.true;
        expect(has('512x512', 'maskable'), '512px maskable icon').to.be.true;
      });
    });
  });

  it('serves every manifest icon as an image', () => {
    manifestHref().then((href) => {
      cy.request(href).then(({ body }) => {
        const manifest = typeof body === 'string' ? JSON.parse(body) : body;
        manifest.icons.forEach(({ src, type }) => {
          cy.request(new URL(src, new URL(href, Cypress.config('baseUrl'))).href).then((res) => {
            expect(res.status, src).to.eq(200);
            expect(res.headers['content-type'], src).to.include(type.split('/')[0]);
          });
        });
      });
    });
  });

  it('matches the browser chrome to the app theme', () => {
    manifestHref().then((href) => {
      cy.request(href).then(({ body }) => {
        const manifest = typeof body === 'string' ? JSON.parse(body) : body;
        cy.get('meta[name="theme-color"]').should('have.attr', 'content', manifest.theme_color);
      });
    });
  });

  it('is set up for notched phones and home screen launches', () => {
    cy.get('meta[name="viewport"]').should('have.length', 1).and('have.attr', 'content').and('include', 'viewport-fit=cover');
    cy.get('meta[name="apple-mobile-web-app-capable"]').should('have.attr', 'content', 'yes');
    cy.get('link[rel="apple-touch-icon"]')
      .invoke('attr', 'href')
      .then((href) => cy.request(href).its('status').should('eq', 200));
  });

  it('scales type up on large displays', () => {
    cy.viewport(2560, 1440);
    cy.document().should((doc) => {
      expect(doc.defaultView.getComputedStyle(doc.documentElement).fontSize).to.eq('20px');
    });
    cy.get('.weeklyForecast').invoke('outerWidth').should('be.gt', 900);
  });
});
