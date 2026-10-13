'use strict';

const { expectRequest, visitStubbed } = require('../support/stubs');

describe('Weather view', () => {
  it('loads current conditions from the weather API', () => {
    visitStubbed();
    cy.wait('@weather');
    cy.get('.currentTemp').should('contain.text', '69');
    cy.contains('Overcast.').should('be.visible');
    cy.get('.currentTopBar').within(() => {
      cy.contains(/Humidity/).parent().should('contain.text', '73%');
      cy.contains(/Pressure/).parent().should('contain.text', '1011 mb');
    });
    cy.get('.currentMeta').should('contain.text', 'Feels Like');
  });

  it('requests weather for the saved location with units and timezone', () => {
    visitStubbed();
    expectRequest('geocode', ({ query }) => query.postalcode === '64106');
    expectRequest(
      'weather',
      ({ url, headers }) => /\/39\.1031,-94\.5822\/unit\/IMPERIAL$/.test(url) && Boolean(headers['x-tz']),
      'Kansas City weather request with an x-tz header'
    );
  });

  it('starts the 24-hour strip at the current hour even though the API sends earlier hours', () => {
    visitStubbed();
    cy.wait('@weather');
    cy.get('.dailyOverview').should('be.visible');
    cy.get('.overviewBar').its('length').should('be.gte', 1);
    cy.get('.overviewDetailsTime').first().should('have.text', '2pm');
  });

  it('keeps the 24-hour strip aligned with the daily list', () => {
    visitStubbed();
    cy.wait('@weather');
    cy.get('.dailyOverview').then(($strip) => {
      cy.get('.weeklyForecast').invoke('width').should('be.closeTo', $strip.width(), 24);
    });
  });

  it('survives a failed weather request', () => {
    visitStubbed({ weather: { statusCode: 500, body: 'boom' } });
    cy.wait('@weather');
    cy.get('.weeklyForecastRow').should('have.length.gte', 1);
    cy.get('.app-navbar').should('be.visible');
  });

  describe('daily accordion', () => {
    beforeEach(() => {
      visitStubbed();
      cy.wait('@weather');
    });

    it('lists seven days starting with Today', () => {
      cy.get('.weeklyForecastRow').should('have.length', 7);
      cy.get('.forecastDayCol').first().should('have.text', 'Today');
    });

    it('opens and closes a row', () => {
      cy.get('.weeklyForecastRow').first().as('today');
      cy.get('@today').find('.displayDrawer').should('not.be.visible');
      cy.get('@today').find('.buttonRow').click();
      cy.get('@today').should('have.class', 'open');
      cy.get('@today').find('.displayDrawer').should('be.visible').and('contain.text', 'Overcast');
      cy.get('@today').find('.buttonRow').click();
      cy.get('@today').should('not.have.class', 'open');
      cy.get('@today').find('.displayDrawer').should('not.be.visible');
    });

    it('pads the open drawer away from its edges', () => {
      cy.get('.weeklyForecastRow').first().find('.buttonRow').click();
      cy.get('.weeklyForecastRow').first().find('.displayDrawer').should(($drawer) => {
        const style = getComputedStyle($drawer[0]);
        expect(parseFloat(style.paddingBottom)).to.be.greaterThan(8);
        expect(parseFloat(style.paddingLeft)).to.be.greaterThan(8);
      });
    });
  });

  describe('hourly graph', () => {
    beforeEach(() => {
      visitStubbed();
      cy.wait('@weather');
    });

    it('charts Today from midnight, scrolled to now with a now marker', () => {
      cy.contains('.forecastDayCol', 'Today').click();
      cy.get('.hourlyGraph').should('be.visible');
      cy.get('.hourlyGraph-time').should('have.length', 24).first().should('have.text', '12am');
      cy.get('.hourlyGraph-track').its('length').should('be.gte', 6);
      cy.get('.hourlyGraph-now').should('exist').and(($now) => {
        expect(parseFloat($now[0].style.left)).to.be.closeTo((14.5 / 24) * 100, 0.01);
      });
      cy.get('.hourlyGraph-scroll').invoke('scrollLeft').should('be.greaterThan', 0);
      cy.get('.hourlyGraph-tip-title').should('contain.text', '2pm');
    });

    it('updates the details panel for the focused hour', () => {
      cy.contains('.forecastDayCol', 'Today').click();
      cy.get('.hourlyGraph-hit').eq(3).focus();
      cy.get('.hourlyGraph-tip-title').should('contain.text', '3am').and('contain.text', 'Rain');
      cy.get('.hourlyGraph-hit').eq(3).should('have.class', 'is-active');
      cy.get('.hourlyGraph-hit').eq(3).blur();
      cy.get('.hourlyGraph-tip-title').should('contain.text', '2pm');
    });

    it('draws each line across the full chart width', () => {
      cy.contains('.forecastDayCol', 'Today').click();
      cy.get('.hourlyGraph-plot polyline').first().invoke('attr', 'points').then((points) => {
        const xs = points.trim().split(/\s+/).map((pair) => Number(pair.split(',')[0]));
        expect(Math.min(...xs)).to.eq(0);
        expect(Math.max(...xs)).to.eq(24);
      });
    });

    it('opens a later day at midnight without a now marker', () => {
      cy.get('.weeklyForecastRow').eq(2).find('.buttonRow').click();
      cy.get('.weeklyForecastRow').eq(2).within(() => {
        cy.get('.hourlyGraph').should('be.visible');
        cy.get('.hourlyGraph-now').should('not.exist');
        cy.get('.hourlyGraph-time').first().should('have.text', '12am');
        cy.get('.hourlyGraph-scroll').invoke('scrollLeft').should('eq', 0);
      });
    });
  });
});
