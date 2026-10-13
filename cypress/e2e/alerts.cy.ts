import type { AlertsResponse, WeatherAlert } from '../../src/models/alerts';
import { HOUR, fixedNow, visitStubbed, withPreferences } from '../support/stubs';

const alert = (overrides: Partial<WeatherAlert> = {}): WeatherAlert => {
  const now = fixedNow();
  return {
    id: 'urn:oid:1',
    source: 'NWS',
    event: 'Wind Advisory',
    headline: 'Wind Advisory issued by NWS Kansas City',
    description: 'Southwest winds 20 to 30 mph with gusts up to 50 mph.',
    instruction: 'Secure outdoor objects.',
    severity: 'MODERATE',
    urgency: 'Expected',
    certainty: 'Likely',
    onset: now - HOUR,
    expires: now + 3 * HOUR,
    ends: now + 6 * HOUR,
    sender: 'NWS Kansas City/Pleasant Hill MO',
    areas: 'Jackson, MO',
    url: 'https://api.weather.gov/alerts/urn:oid:1',
    ...overrides,
  };
};

const reply = (alerts: WeatherAlert[], extra: Partial<AlertsResponse> = {}): AlertsResponse => ({
  coverage: true,
  sources: ['NWS'],
  alerts,
  ...extra,
});

describe('Weather alerts', () => {
  it('asks for alerts at the resolved location', () => {
    visitStubbed();
    cy.wait('@alerts').its('request.url').should('match', /\/alerts\/39\.1031,-94\.5822$/);
  });

  it('lists active alerts in the order the API ranks them', () => {
    visitStubbed({
      alerts: reply([
        alert({ id: 'tor', event: 'Tornado Warning', severity: 'EXTREME' }),
        alert({ id: 'wind' }),
      ]),
    });
    cy.get('.weatherAlerts').should('have.attr', 'aria-label', '2 active weather alerts');
    cy.get('.weatherAlert').should('have.length', 2);
    cy.get('.weatherAlert').first().should('have.class', 'severity-extreme').and('contain.text', 'Tornado Warning');
    cy.get('.weatherAlert').eq(1).should('have.class', 'severity-moderate').and('contain.text', 'until');
  });

  it('expands an alert to show what to do and who issued it', () => {
    visitStubbed({ alerts: reply([alert()]) });
    cy.get('.weatherAlert-body').should('not.be.visible');
    cy.contains('.weatherAlert-event', 'Wind Advisory').click();
    cy.get('.weatherAlert').should('have.attr', 'open');
    cy.get('.weatherAlert-body')
      .should('be.visible')
      .and('contain.text', 'gusts up to 50 mph')
      .and('contain.text', 'What to do')
      .and('contain.text', 'Secure outdoor objects.')
      .and('contain.text', 'Jackson, MO')
      .and('contain.text', 'National Weather Service');
  });

  it('opens the full alert in a dialog that closes back to the forecast', () => {
    visitStubbed({ alerts: reply([alert({ url: 'https://forecast.weather.gov/MapClick.php?lat=39.1&lon=-94.58' })]) });
    cy.contains('.weatherAlert-event', 'Wind Advisory').click();
    cy.get('.weatherAlert-body .weatherAlert-more').click();

    cy.location('search').should('eq', '?alert=urn%3Aoid%3A1');
    cy.get('dialog.alertDialog').should('have.attr', 'open');
    cy.get('dialog.alertDialog')
      .should('have.class', 'severity-moderate')
      .within(() => {
        cy.contains('h2', 'Wind Advisory');
        cy.contains('dt', 'Urgency').next().should('have.text', 'Expected');
        cy.contains('dt', 'Certainty').next().should('have.text', 'Likely');
        cy.contains('dt', 'Issued by').next().should('contain.text', 'NWS Kansas City');
        cy.contains('.alertDialog-instruction', 'Secure outdoor objects.');
        cy.contains('a', 'View on National Weather Service')
          .should('have.attr', 'href', 'https://forecast.weather.gov/MapClick.php?lat=39.1&lon=-94.58')
          .and('have.attr', 'target', '_blank');
      });

    cy.get('.alertDialog-close').click();
    cy.get('dialog.alertDialog').should('not.exist');
    cy.location('search').should('eq', '');
    cy.get('.currentTemp').should('be.visible');
  });

  it('closes the dialog from the backdrop and the back button', () => {
    visitStubbed({ alerts: reply([alert()]) });
    cy.contains('.weatherAlert-event', 'Wind Advisory').click();
    cy.get('.weatherAlert-body .weatherAlert-more').click();
    cy.get('dialog.alertDialog').should('have.attr', 'open');
    // Backdrop clicks land on the <dialog> itself rather than its panel.
    cy.get('dialog.alertDialog').then(($dialog) => {
      $dialog[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    cy.get('dialog.alertDialog').should('not.exist');

    cy.get('.weatherAlert-body .weatherAlert-more').click();
    cy.get('dialog.alertDialog').should('have.attr', 'open');
    cy.go('back');
    cy.get('dialog.alertDialog').should('not.exist');
    cy.location('search').should('eq', '');
  });

  it('offers the full alert from the collapsed bar without expanding it', () => {
    visitStubbed({ alerts: reply([alert()]) });
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlert-summary .weatherAlert-more').should('be.visible');
    cy.get('.weatherAlert-summary .weatherAlert-more').click();
    cy.get('dialog.alertDialog').should('have.attr', 'open');
    cy.get('.weatherAlert').should('not.have.attr', 'open');
    cy.get('.alertDialog-close').click();

    cy.contains('.weatherAlert-event', 'Wind Advisory').click();
    cy.get('.weatherAlert-summary .weatherAlert-more').should('not.be.visible');
    cy.get('.weatherAlert-body .weatherAlert-more').should('be.visible');
  });

  it('opens a shared alert link directly', () => {
    visitStubbed({ path: '/?alert=urn%3Aoid%3A1', alerts: reply([alert()]) });
    cy.get('dialog.alertDialog').should('have.attr', 'open');
    cy.get('dialog.alertDialog').should('contain.text', 'Wind Advisory');
    cy.get('.alertDialog-close').click();
    cy.get('dialog.alertDialog').should('not.exist');
    cy.location('search').should('eq', '');
  });

  it('explains when a shared alert is no longer active', () => {
    visitStubbed({ path: '/?alert=urn%3Aoid%3Agone', alerts: reply([alert()]) });
    cy.get('dialog.alertDialog').should('contain.text', 'Alert no longer active');
  });

  it('notes when an alert has not started yet', () => {
    visitStubbed({ alerts: reply([alert({ onset: fixedNow() + 2 * HOUR })]) });
    cy.contains('.weatherAlert-event', 'Wind Advisory').click();
    cy.get('.weatherAlert-body').should('contain.text', 'Starts');
  });

  it('hides alerts that have already expired', () => {
    visitStubbed({ alerts: reply([alert({ expires: fixedNow() - HOUR })]) });
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
  });

  it('stays out of the way when there are no alerts', () => {
    visitStubbed();
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
    cy.get('.alertsCoverageNote').should('not.exist');
  });

  it('says so when no provider covers the area, rather than implying an all-clear', () => {
    visitStubbed({ alerts: { coverage: false, sources: [], alerts: [] } });
    cy.get('.alertsCoverageNote').should('contain.text', 'aren\'t available for this area');
  });

  it('keeps the forecast working when the alerts request fails', () => {
    visitStubbed({ alerts: { statusCode: 502, body: { error: 'down' } } });
    cy.wait('@alerts');
    cy.get('.currentTemp').should('be.visible');
    cy.get('.weatherAlerts').should('not.exist');
    cy.get('.weatherError').should('not.exist');
  });

  it('shows alerts even before the forecast has loaded', () => {
    visitStubbed({ weatherDelay: 1500, alerts: reply([alert({ event: 'Flood Warning', severity: 'SEVERE' })]) });
    cy.get('.weatherSkeleton').should('be.visible');
    cy.contains('.weatherAlert', 'Flood Warning').should('be.visible');
  });

  describe('compact layout', () => {
    const three = reply([
      alert({ id: 'tor', event: 'Tornado Warning', severity: 'EXTREME' }),
      alert({ id: 'svr', event: 'Severe Thunderstorm Watch', severity: 'SEVERE' }),
      alert({ id: 'wind', event: 'Wind Advisory' }),
    ]);
    const compact = withPreferences({ layout: 'compact' });

    it('shrinks each alert to a chip and fits several on a row', () => {
      visitStubbed({ alerts: three, onBeforeLoad: compact });
      cy.get('.weatherAlerts').should('have.class', 'is-compact');
      cy.get('.weatherAlert').should('not.exist');
      cy.get('.weatherAlertChip').should('have.length', 3);
      cy.get('.weatherAlertChip').first().should('have.class', 'severity-extreme').and('have.text', 'Tornado Warning');
      cy.get('.weatherAlertChip').then(($chips) => {
        const tops = [...$chips].map((chip) => Math.round(chip.getBoundingClientRect().top));
        expect(new Set(tops).size).to.eq(1);
      });
    });

    it('puts two chips on a row on phones', () => {
      cy.viewport(390, 844);
      visitStubbed({ alerts: three });
      cy.get('.weatherAlertChip').should('have.length', 3);
      cy.get('.weatherAlertChip').then(($chips) => {
        const [first, second, third] = [...$chips].map((chip) => chip.getBoundingClientRect());
        expect(Math.round(first.top)).to.eq(Math.round(second.top));
        expect(third.top).to.be.greaterThan(first.top);
      });
    });

    it('opens the full alert from a chip', () => {
      visitStubbed({ alerts: three, onBeforeLoad: compact });
      cy.get('.currentTemp').should('be.visible');
      cy.contains('.weatherAlertChip', 'Wind Advisory')
        .invoke('attr', 'aria-label')
        .should('match', /^Wind Advisory, until .+\. View full alert$/);
      cy.contains('.weatherAlertChip', 'Wind Advisory').click();
      cy.location('search').should('eq', '?alert=wind');
      cy.get('dialog.alertDialog').should('have.attr', 'open');
      cy.get('dialog.alertDialog').should('contain.text', 'Wind Advisory');
    });
  });
});
