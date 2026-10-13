import { visitStubbed } from '../support/stubs';

type ManifestIcon = { src: string; sizes: string; type: string; purpose: string };
type Manifest = { theme_color: string; background_color: string; icons: ManifestIcon[] };

const manifestHref = () =>
  cy
    .get('link[rel="manifest"]')
    .invoke('attr', 'href')
    .then((href) => String(href));

const parseManifest = (body: unknown): Manifest => (typeof body === 'string' ? JSON.parse(body) : (body as Manifest));

describe('Progressive web app', () => {
  beforeEach(() => {
    visitStubbed();
  });

  it('links an installable web app manifest', () => {
    manifestHref().then((href) => {
      cy.request(href).then(({ status, body }) => {
        const manifest = parseManifest(body);
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

        const has = (sizes: string, purpose: string) =>
          manifest.icons.some((icon) => icon.sizes === sizes && icon.purpose === purpose);
        expect(has('192x192', 'any'), '192px icon').to.be.true;
        expect(has('512x512', 'any'), '512px icon').to.be.true;
        expect(has('512x512', 'maskable'), '512px maskable icon').to.be.true;
      });
    });
  });

  it('serves every manifest icon as an image', () => {
    manifestHref().then((href) => {
      cy.request(href).then(({ body }) => {
        const manifest = parseManifest(body);
        manifest.icons.forEach(({ src, type }) => {
          cy.request(new URL(src, new URL(href, Cypress.config('baseUrl') ?? undefined)).href).then((res) => {
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
        const manifest = parseManifest(body);
        cy.get('meta[name="theme-color"]').should('have.attr', 'content', manifest.theme_color);
      });
    });
  });

  it('is set up for notched phones and home screen launches', () => {
    cy.get('meta[name="viewport"]').should('have.length', 1).and('have.attr', 'content').and('include', 'viewport-fit=cover');
    cy.get('meta[name="apple-mobile-web-app-capable"]').should('have.attr', 'content', 'yes');
    cy.get('link[rel="apple-touch-icon"]')
      .invoke('attr', 'href')
      .then((href) => cy.request(String(href)).its('status').should('eq', 200));
  });

  it('scales type up on large displays', () => {
    cy.viewport(2560, 1440);
    cy.document().should((doc) => {
      expect(doc.defaultView!.getComputedStyle(doc.documentElement).fontSize).to.eq('20px');
    });
    cy.get('.weeklyForecast').invoke('outerWidth').should('be.gt', 900);
  });
});
