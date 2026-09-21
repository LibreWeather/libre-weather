'use strict';

const API = '**/weather/**';

const weatherStub = {
  source: 'METEO',
  current: {
    apparentTemp: { value: 81, unit: 'F' },
    condition: 'CLOUDY',
    description: 'Overcast',
    dewPoint: { value: 68, unit: 'F' },
    humidity: 73,
    pressure: { value: 1011, unit: 'MB' },
    summary: 'Cloudy',
    sunrise: Date.now() - 8 * 3600000,
    sunset: Date.now() + 4 * 3600000,
    temp: { value: 69, unit: 'F' },
    time: Date.now(),
    uvIndex: 2,
    visibility: { value: 9, unit: 'MI' },
    windspeed: { magnitude: 8, direction: 180, unit: 'MPH' },
  },
  daily: Array.from({ length: 7 }, (_, day) => ({
    apparentTemp: {
      min: { value: 50 + day, unit: 'F' },
      max: { value: 77 + day, unit: 'F' },
    },
    condition: day % 2 ? 'RAIN' : 'CLOUDY',
    description: day % 2 ? 'Rain' : 'Overcast',
    precipProbability: day % 2 ? 70 : 10,
    rainVolume: { value: day % 2 ? 0.2 : 0, unit: 'IN' },
    snowVolume: { value: 0, unit: 'IN' },
    sunrise: Date.now(),
    sunset: Date.now() + 3600000,
    sunshineDuration: 18000,
    temp: {
      min: { value: 50 + day, unit: 'F' },
      max: { value: 77 + day, unit: 'F' },
    },
    time: Date.now() + day * 86400000,
    uvIndex: 4,
    windspeed: { magnitude: 8, direction: 200, unit: 'MPH' },
  })),
  hourly: Array.from({ length: 48 }, (_, hour) => ({
    apparentTemp: { value: 70, unit: 'F' },
    cloudCover: 80,
    condition: hour < 6 ? 'RAIN' : 'CLOUDY',
    description: hour < 6 ? 'Rain' : 'Overcast',
    dewPoint: { value: 62, unit: 'F' },
    humidity: 70,
    precipProbability: hour < 6 ? 80 : 5,
    precipVolume: { value: hour < 6 ? 0.04 : 0, unit: 'IN' },
    pressure: { value: 1012, unit: 'MB' },
    rainVolume: { value: hour < 6 ? 0.04 : 0, unit: 'IN' },
    snowVolume: { value: 0, unit: 'IN' },
    sunshineDuration: hour % 24 > 8 && hour % 24 < 16 ? 3600 : 0,
    temp: { value: 60 + (hour % 12), unit: 'F' },
    time: Date.now() + hour * 3600000,
    uvIndex: hour % 24 > 8 ? 4 : 0,
    visibility: { value: 8, unit: 'MI' },
    windGust: { magnitude: 12, direction: 190, unit: 'MPH' },
    windspeed: { magnitude: 7, direction: 190, unit: 'MPH' },
  })),
};

describe('Libre Weather app', () => {
  beforeEach(() => {
    cy.intercept('GET', API, weatherStub).as('weather');
    cy.visit('/');
  });

  it('shows the brand cluster with licenses and GitHub next to the wordmark', () => {
    cy.contains('a.navbar-brand', 'Libre Weather').should('be.visible');
    cy.get('a[aria-label="Licenses"]').should('be.visible');
    cy.get('a[aria-label="GitHub"]')
      .should('be.visible')
      .and('have.attr', 'href', 'https://github.com/LibreWeather/libre-weather');
  });

  it('loads current conditions from the weather API', () => {
    cy.wait('@weather');
    cy.contains('69').should('be.visible');
    cy.contains(/partly cloudy|overcast|rain/i).should('exist');
    cy.contains(/Wind/i).should('be.visible');
    cy.contains(/Humidity/i).should('be.visible');
    cy.contains(/Pressure/i).should('be.visible');
  });

  it('renders a 24-hour forecast strip aligned with the daily list', () => {
    cy.wait('@weather');
    cy.get('.dailyOverview').should('be.visible');
    cy.get('.weeklyForecast').should('be.visible');
    cy.get('.dailyOverview').then(($strip) => {
      cy.get('.weeklyForecast').invoke('width').should('be.closeTo', $strip.width(), 24);
    });
    cy.get('.overviewBar').its('length').should('be.gte', 1);
  });

  it('lists seven daily summaries and expands Today into an hourly graph', () => {
    cy.wait('@weather');
    cy.get('.weeklyForecastRow').should('have.length', 7);
    cy.contains('.forecastDayCol', 'Today').click();
    cy.get('.hourlyGraph').should('be.visible');
    cy.get('.hourlyGraph-scroll').should('exist');
    cy.get('.hourlyGraph-track').its('length').should('be.gte', 4);
    cy.get('.hourlyGraph-tip').should('contain.text', 'Temp');
    cy.get('.hourlyGraph-hit').first().focus();
    cy.get('.hourlyGraph-tip').should('be.visible');
  });

  it('opens the same graph from a later weekday row', () => {
    cy.wait('@weather');
    cy.get('.weeklyForecastRow').eq(2).find('.buttonRow').click();
    cy.get('.weeklyForecastRow').eq(2).find('.hourlyGraph').should('be.visible');
  });

  it('navigates to licenses from the OSI icon and back via the brand', () => {
    cy.get('a[aria-label="Licenses"]').click();
    cy.location('pathname').should('eq', '/licenses');
    cy.contains(/Built with/i).should('be.visible');
    cy.contains('a.navbar-brand', 'Libre Weather').click();
    cy.location('pathname').should('eq', '/');
  });

  it('exposes location and unit controls in the settings bar', () => {
    cy.get('#locationName').should('be.visible');
    cy.get('input[aria-label="ZIP Code"]').should('exist');
    cy.get('#custom-switch').should('exist');
    cy.contains('˚F').should('be.visible');
    cy.contains('˚C').should('be.visible');
  });
});
