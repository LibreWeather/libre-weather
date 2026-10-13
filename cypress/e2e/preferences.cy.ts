import {
  HOUR,
  fireInstallPrompt,
  fixedNow,
  savedPreferences,
  visitStubbed,
  weatherFor,
  withPreferences,
} from '../support/stubs';

const openPreferences = () => {
  cy.get('.currentTemp').should('be.visible');
  cy.get('button[aria-label="Preferences"]').click();
  cy.get('dialog.prefsPanel').should('have.attr', 'open');
};

const choose = (field: string, option: string) => cy.contains('.prefs-field', field).contains('label', option).click();

const closePreferences = () => {
  cy.get('.prefsPanel-close').click();
  cy.get('dialog.prefsPanel').should('not.exist');
};

describe('Preferences', () => {
  describe('panel', () => {
    it('drops down from the gear and closes back to the forecast', () => {
      visitStubbed();
      openPreferences();
      cy.location('search').should('eq', '?prefs=');
      cy.get('button[aria-label="Preferences"]').then(($gear) => {
        const gear = $gear[0].getBoundingClientRect();
        cy.get('dialog.prefsPanel').should(($panel) => {
          const panel = $panel[0].getBoundingClientRect();
          expect(panel.top).to.be.closeTo(gear.bottom + 8, 2);
          expect(panel.right).to.be.closeTo(gear.right, 2);
        });
      });
      closePreferences();
      cy.location('search').should('eq', '');
    });

    it('opens from a link and closes with the back button', () => {
      visitStubbed({ path: '/?prefs' });
      cy.get('dialog.prefsPanel').should('have.attr', 'open');
      cy.get('.prefsPanel-close').click();
      cy.location('search').should('eq', '');

      openPreferences();
      cy.go('back');
      cy.get('dialog.prefsPanel').should('not.exist');
    });

    it('slides up as a sheet on phones', () => {
      cy.viewport(390, 844);
      visitStubbed();
      openPreferences();
      cy.get('dialog.prefsPanel').should(($panel) => {
        const panel = $panel[0].getBoundingClientRect();
        expect(panel.bottom).to.be.closeTo(844, 1);
        expect(panel.width).to.be.closeTo(390, 1);
      });
    });
  });

  describe('temperature', () => {
    it('defaults to Celsius for browsers outside Fahrenheit regions', () => {
      visitStubbed({ languages: ['en-GB', 'en'] });
      weatherFor(/\/unit\/METRIC$/);
      cy.get('.currentTemp').should('contain.text', '21');
      openPreferences();
      cy.contains('.prefs-field', 'Temperature').find('input[value="auto"]').should('be.checked');
      cy.contains('.prefs-field', 'Temperature').should('contain.text', 'Auto (°C)');
    });

    it('defaults to Fahrenheit for US browsers', () => {
      visitStubbed({ languages: ['es-US', 'es'] });
      weatherFor(/\/unit\/IMPERIAL$/);
    });

    it('keeps a saved choice over the browser locale', () => {
      visitStubbed({ languages: ['de-DE'], onBeforeLoad: withPreferences({ temperature: 'F' }) });
      weatherFor(/\/unit\/IMPERIAL$/);
    });

    it('carries over the unit saved before preferences existed', () => {
      visitStubbed({
        onBeforeLoad(win) {
          win.localStorage.setItem('units', 'METRIC');
        },
      });
      weatherFor(/\/unit\/METRIC$/);
    });

    it('switches to Celsius, refetches and remembers it', () => {
      visitStubbed();
      cy.get('.currentTemp').should('contain.text', '69');
      openPreferences();
      choose('Temperature', '°C');
      weatherFor(/\/unit\/METRIC$/);
      cy.get('.currentTemp').should('contain.text', '21');
      savedPreferences().its('temperature').should('eq', 'C');

      cy.reload();
      weatherFor(/\/unit\/METRIC$/);
      cy.get('.currentTemp').should('contain.text', '21');
    });
  });

  describe('wind, rain and clock', () => {
    it('shows wind in km/h alongside Fahrenheit', () => {
      visitStubbed();
      openPreferences();
      choose('Wind', 'km/h');
      closePreferences();
      cy.get('.currentTopBar').should('contain.text', '13 km/h');
      cy.get('.currentTemp').should('contain.text', '69');
      weatherFor(/\/unit\/IMPERIAL$/);
    });

    it('shows rain in millimeters alongside Fahrenheit', () => {
      visitStubbed({ onBeforeLoad: withPreferences({ precip: 'mm' }) });
      cy.get('.weeklyForecastRow.open').should('contain.text', ' mm').and('not.contain.text', ' in');
    });

    it('switches between 12- and 24-hour time', () => {
      visitStubbed();
      cy.get('.hourlyGraph-time').first().should('have.text', '12am');
      openPreferences();
      choose('Clock', '24h');
      closePreferences();
      cy.get('.hourlyGraph-time').first().should('have.text', '00:00');
      cy.get('.hourlyGraph-tip-title').should('contain.text', '14:00');
    });
  });

  describe('alerts', () => {
    const activeAlert = {
      coverage: true,
      sources: ['NWS'],
      alerts: [
        {
          id: 'urn:oid:1',
          source: 'NWS',
          event: 'Wind Advisory',
          headline: 'Wind Advisory',
          description: 'Windy.',
          instruction: null,
          severity: 'MODERATE',
          urgency: null,
          certainty: null,
          onset: null,
          expires: fixedNow() + HOUR,
          ends: null,
          sender: 'NWS',
          areas: '',
          url: null,
        },
      ],
    };

    it('can turn alerts off entirely', () => {
      visitStubbed({ alerts: activeAlert });
      cy.get('.weatherAlert').should('be.visible');
      openPreferences();
      cy.contains('.prefs-toggle', 'Show weather alerts').find('input').uncheck();
      closePreferences();
      cy.get('.weatherAlerts').should('not.exist');
      savedPreferences().its('alerts').should('eq', false);
    });

    it('skips the alerts request when off', () => {
      visitStubbed({ alerts: activeAlert, onBeforeLoad: withPreferences({ alerts: false }) });
      cy.get('.currentTemp').should('be.visible');
      cy.get('@alerts.all').should('have.length', 0);
      cy.get('.weatherAlerts').should('not.exist');
    });
  });

  describe('display', () => {
    it('reduces transparency by turning off blur', () => {
      visitStubbed();
      cy.get('.app-navbar').should(($nav) => {
        expect(getComputedStyle($nav[0]).backdropFilter).to.not.eq('none');
      });
      openPreferences();
      choose('Reduce transparency', 'On');
      cy.get('html').should('have.class', 'reduce-transparency');
      cy.get('.app-navbar').should(($nav) => {
        expect(getComputedStyle($nav[0]).backdropFilter).to.eq('none');
      });
    });

    it('reduces motion', () => {
      visitStubbed({ onBeforeLoad: withPreferences({ motion: 'reduce' }) });
      cy.get('.currentTemp').should('be.visible');
      cy.get('html').should('have.class', 'reduce-motion');
    });
  });

  describe('install banner', () => {
    it('can bring the install banner back after dismissing it', () => {
      visitStubbed({ onBeforeLoad: withPreferences({ installBannerDismissed: true }) });
      cy.get('.currentTemp').should('be.visible');
      cy.window().then((win) => fireInstallPrompt(win));
      cy.get('.installBanner').should('not.exist');
      openPreferences();
      cy.contains('button', 'Show install banner again').click();
      cy.get('.installBanner').should('exist');
    });
  });
});
