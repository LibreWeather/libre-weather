import { visitStubbed } from '../support/stubs';

describe('Navigation bar', () => {
  it('shows the brand cluster with licenses and GitHub next to the wordmark', () => {
    visitStubbed();
    cy.contains('a.navbar-brand', 'Libre Weather').should('be.visible');
    cy.get('a[aria-label="Licenses"]').should('be.visible');
    cy.get('a[aria-label="GitHub"]')
      .should('be.visible')
      .and('have.attr', 'href', 'https://github.com/LibreWeather/libre-weather')
      .and('have.attr', 'target', '_blank');
  });

  it('floats above the page and stays pinned while scrolling', () => {
    visitStubbed();
    cy.wait('@weather');
    cy.get('.app-navbar').should('have.css', 'position', 'sticky').and(($nav) => {
      expect($nav[0].getBoundingClientRect().top).to.be.greaterThan(0);
    });
    cy.contains('.forecastDayCol', 'Today').click();
    cy.scrollTo('bottom');
    cy.window().its('scrollY').should('be.greaterThan', 0);
    cy.get('.app-navbar').should('be.visible').and(($nav) => {
      const { top } = $nav[0].getBoundingClientRect();
      expect(top).to.be.within(0, 24);
    });
  });

  it('navigates to licenses from the OSI icon and back via the brand', () => {
    visitStubbed();
    cy.get('a[aria-label="Licenses"]').click();
    cy.location('pathname').should('eq', '/licenses');
    cy.contains(/Built with/i).should('be.visible');
    cy.contains('h6', /^react\s*:\s*MIT$/).should('exist');
    cy.contains('a.navbar-brand', 'Libre Weather').click();
    cy.location('pathname').should('eq', '/');
  });

  it('renders the licenses page directly', () => {
    visitStubbed({ path: '/licenses' });
    cy.contains(/Built with/i).should('be.visible');
    cy.get('h6').its('length').should('be.greaterThan', 10);
  });

  describe('on a phone', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
    });

    it('collapses settings behind the menu toggle', () => {
      visitStubbed();
      cy.get('.app-settings').should('not.be.visible');
      cy.get('.navbar-toggler').should('be.visible').click();
      cy.get('.app-settings').should('be.visible');
      cy.get('input[aria-label="ZIP Code"]').should('be.visible');
      cy.get('.navbar-toggler').click();
      cy.get('.app-settings').should('not.be.visible');
    });

    it('keeps the floating bar inset from the screen edges', () => {
      visitStubbed();
      cy.get('.app-navbar').should(($nav) => {
        const { left, right } = $nav[0].getBoundingClientRect();
        expect(left).to.be.greaterThan(0);
        expect(right).to.be.lessThan(390);
      });
    });
  });
});
