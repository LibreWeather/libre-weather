'use strict';

const { buildWeather, expectRequest, fixedNow, visitStubbed } = require('../support/stubs');

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

  it('shows a skeleton until the forecast arrives', () => {
    visitStubbed({ weatherDelay: 800 });
    cy.get('.weatherSkeleton').should('be.visible').and('have.class', 'is-animated');
    cy.get('.weatherSkeleton-day').should('have.length', 7);
    cy.get('.currentTemp').should('not.exist');
    cy.get('.currentTemp', { timeout: 10000 }).should('contain.text', '69');
    cy.get('.weatherSkeleton').should('not.exist');
  });

  it('dims the forecast while new weather loads', () => {
    visitStubbed({ weatherDelay: 400 });
    cy.get('.currentTemp').should('be.visible');
    cy.get('.header').should('not.have.class', 'is-refreshing');
    cy.get('button[aria-label="Preferences"]').click();
    cy.contains('.prefs-field', 'Temperature').contains('label', '°C').click();
    cy.get('.header').should('have.class', 'is-refreshing').and('have.attr', 'aria-busy', 'true');
    cy.get('.header').should('not.have.class', 'is-refreshing');
    cy.get('.currentTemp').should('contain.text', '21');
  });

  it('does not fetch weather for a made-up location before the real one resolves', () => {
    visitStubbed();
    cy.get('.currentTemp').should('be.visible');
    cy.get('@weather.all').then((calls) => {
      expect(calls.map(({ request }) => request.url)).to.have.length(1);
      expect(calls[0].request.url).to.match(/\/39\.1031,-94\.5822\//);
    });
  });

  it('asks which place was meant when the saved code matches several', () => {
    visitStubbed({
      onBeforeLoad(win) {
        win.localStorage.setItem('zip', '12345');
      },
    });
    cy.contains('.locationPicker-title', 'Which 12345 did you mean?').should('be.visible');
    cy.get('.locationPicker-option').should('have.length', 2);
    cy.get('.weatherSkeleton').should('be.visible').and('not.have.class', 'is-animated');
    cy.get('@weather.all').should('have.length', 0);

    cy.contains('.locationPicker-option', 'Rotterdam').click();
    expectRequest('weather', ({ url }) => /\/42\.8,-73\.9\/unit\/IMPERIAL$/.test(url));
    cy.get('.locationPicker').should('not.exist');
    cy.get('#locationName').should('have.text', 'Rotterdam');
    cy.get('.currentTemp').should('be.visible');
  });

  it('remembers the chosen place across reloads instead of asking again', () => {
    visitStubbed({
      onBeforeLoad(win) {
        win.localStorage.setItem('zip', '12345');
      },
    });
    cy.contains('.locationPicker-option', 'Rotterdam').click();
    cy.get('.currentTemp').should('be.visible');

    cy.reload();
    expectRequest('weather', ({ url }) => /\/42\.8,-73\.9\/unit\/IMPERIAL$/.test(url));
    cy.get('#locationName').should('have.text', 'Rotterdam');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.locationPicker').should('not.exist');
  });

  it('explains when the saved code matches nothing', () => {
    visitStubbed({
      onBeforeLoad(win) {
        win.localStorage.setItem('zip', '00000');
      },
    });
    cy.get('.weatherError').should('contain.text', 'find that location');
    cy.get('.weatherError button').should('not.exist');
    cy.get('.weatherSkeleton').should('not.have.class', 'is-animated');
    cy.get('@weather.all').should('have.length', 0);
  });

  it('shows an error with a retry when the weather request fails', () => {
    visitStubbed({ weather: { statusCode: 500, body: 'boom' } });
    cy.get('.weatherError').should('be.visible').and('contain.text', 'load the forecast');
    cy.get('.weatherSkeleton').should('be.visible').and('not.have.class', 'is-animated');
    cy.get('.app-navbar').should('be.visible');

    cy.intercept('GET', '**/weather/**', (req) => {
      req.reply(buildWeather(fixedNow(), 'IMPERIAL'));
    }).as('weatherRetry');
    cy.contains('.weatherError button', 'Try again').click();
    cy.wait('@weatherRetry');
    cy.get('.weatherError').should('not.exist');
    cy.get('.currentTemp').should('contain.text', '69');
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

    it('opens Today and keeps later days closed on load', () => {
      cy.get('.weeklyForecastRow').first().should('have.class', 'open');
      cy.get('.weeklyForecastRow').first().find('.displayDrawer').should('be.visible').and('contain.text', 'Overcast');
      cy.get('.weeklyForecastRow.open').should('have.length', 1);
    });

    it('closes and reopens a row', () => {
      cy.get('.weeklyForecastRow').first().as('today');
      cy.get('@today').find('.buttonRow').click();
      cy.get('@today').should('not.have.class', 'open');
      cy.get('@today').find('.displayDrawer').should('not.be.visible');
      cy.get('@today').find('.buttonRow').click();
      cy.get('@today').should('have.class', 'open');
      cy.get('@today').find('.displayDrawer').should('be.visible');
    });

    it('keeps several days open across reloads', () => {
      cy.get('.weeklyForecastRow').eq(2).find('.buttonRow').click();
      cy.get('.weeklyForecastRow').eq(4).find('.buttonRow').click();
      cy.get('.weeklyForecastRow.open').should('have.length', 3);

      cy.reload();
      cy.get('.weeklyForecastRow').should('have.length', 7);
      cy.get('.weeklyForecastRow').eq(0).should('have.class', 'open');
      cy.get('.weeklyForecastRow').eq(2).should('have.class', 'open');
      cy.get('.weeklyForecastRow').eq(4).should('have.class', 'open');
      cy.get('.weeklyForecastRow.open').should('have.length', 3);
    });

    it('remembers that Today was closed', () => {
      cy.get('.weeklyForecastRow').first().find('.buttonRow').click();
      cy.get('.weeklyForecastRow.open').should('have.length', 0);
      cy.window().its('localStorage').invoke('getItem', 'openDays').should('eq', '[]');

      cy.reload();
      cy.get('.weeklyForecastRow').should('have.length', 7);
      cy.get('.weeklyForecastRow.open').should('have.length', 0);
    });

    it('keeps open days when the forecast refreshes', () => {
      cy.get('.weeklyForecastRow').eq(3).find('.buttonRow').click();
      cy.get('button[aria-label="Preferences"]').click();
      cy.contains('.prefs-field', 'Temperature').contains('label', '°C').click();
      cy.get('.prefsPanel-close').click();
      cy.get('.currentTemp').should('contain.text', '21');
      cy.get('.weeklyForecastRow').eq(0).should('have.class', 'open');
      cy.get('.weeklyForecastRow').eq(3).should('have.class', 'open');
      cy.get('.weeklyForecastRow.open').should('have.length', 2);
    });

    it('pads the open drawer away from its edges', () => {
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
      cy.get('.hourlyGraph-hit').eq(3).focus();
      cy.get('.hourlyGraph-tip-title').should('contain.text', '3am').and('contain.text', 'Rain');
      cy.get('.hourlyGraph-hit').eq(3).should('have.class', 'is-active');
      cy.get('.hourlyGraph-hit').eq(3).blur();
      cy.get('.hourlyGraph-tip-title').should('contain.text', '2pm');
    });

    it('draws each line across the full chart width', () => {
      cy.get('.hourlyGraph-plot polyline').first().invoke('attr', 'points').then((points) => {
        const xs = points.trim().split(/\s+/).map((pair) => Number(pair.split(',')[0]));
        expect(Math.min(...xs)).to.eq(0);
        expect(Math.max(...xs)).to.eq(24);
      });
    });

    it('labels hours on a 24-hour clock when preferred', () => {
      visitStubbed({
        onBeforeLoad(win) {
          win.localStorage.setItem('preferences', JSON.stringify({ clock: '24' }));
        },
      });
      cy.get('.hourlyGraph-time').first().should('have.text', '00:00');
      cy.get('.hourlyGraph-tip-title').should('contain.text', '14:00');
      cy.get('.hourTics, .hourDetails').should('not.contain.text', 'pm');
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
