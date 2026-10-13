'use strict';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Local 2:30pm today, so "now" lands mid-day and mid-hour on every run.
const fixedNow = () => new Date().setHours(14, 30, 0, 0);

const PLACES = {
  64106: [{ lat: '39.1031', lon: '-94.5822', address: { city: 'Kansas City', postcode: '64106', country: 'USA' } }],
  90210: [{ lat: '34.0901', lon: '-118.4065', address: { city: 'Beverly Hills', postcode: '90210', country: 'USA' } }],
  10001: [{ lat: '40.7506', lon: '-73.9972', address: { city: 'New York', postcode: '10001', country: 'USA' } }],
  12345: [
    { lat: '42.8142', lon: '-73.9396', address: { city: 'Schenectady', postcode: '12345', country: 'USA' } },
    { lat: '42.8000', lon: '-73.9000', address: { town: 'Rotterdam', postcode: '12345', country: 'USA' } },
  ],
};

const REVERSE = { lat: '40.7128', lon: '-74.0060', address: { town: 'Geoville', postcode: '10001', country: 'USA' } };

const buildWeather = (now, unit = 'IMPERIAL') => {
  const metric = unit === 'METRIC';
  const t = (f) => ({ value: metric ? Math.round(((f - 32) * 5) / 9) : f, unit: metric ? 'C' : 'F' });
  const speed = (mph, direction) => ({ magnitude: mph, direction, unit: metric ? 'MS' : 'MPH' });
  const vol = (inches) => ({ value: inches, unit: metric ? 'MM' : 'IN' });
  const midnight = new Date(now).setHours(0, 0, 0, 0);

  return {
    source: 'METEO',
    current: {
      apparentTemp: t(81),
      condition: 'CLOUDY',
      description: 'Overcast',
      dewPoint: t(68),
      humidity: 73,
      pressure: { value: 1011, unit: 'MB' },
      sunrise: midnight + 7 * HOUR,
      sunset: midnight + 19 * HOUR,
      temp: t(69),
      time: now,
      uvIndex: 2,
      visibility: { value: 9, unit: 'MI' },
      windspeed: speed(8, 180),
    },
    daily: Array.from({ length: 7 }, (_, day) => ({
      apparentTemp: { min: t(50 + day), max: t(77 + day) },
      condition: day % 2 ? 'RAIN' : 'CLOUDY',
      description: day % 2 ? 'Rain' : 'Overcast',
      precipProbability: day % 2 ? 70 : 10,
      rainVolume: vol(day % 2 ? 0.2 : 0),
      snowVolume: vol(0),
      sunrise: midnight + day * DAY + 7 * HOUR,
      sunset: midnight + day * DAY + 19 * HOUR,
      sunshineDuration: 18000,
      temp: { min: t(50 + day), max: t(77 + day) },
      time: midnight + day * DAY,
      uvIndex: 4,
      windspeed: speed(8, 200),
    })),
    // The API returns hourly data from local midnight of the current day.
    hourly: Array.from({ length: 72 }, (_, hour) => ({
      apparentTemp: t(70),
      cloudCover: 80,
      condition: hour % 24 < 6 ? 'RAIN' : 'CLOUDY',
      description: hour % 24 < 6 ? 'Rain' : 'Overcast',
      dewPoint: t(62),
      humidity: 70,
      precipProbability: hour % 24 < 6 ? 80 : 5,
      precipVolume: vol(hour % 24 < 6 ? 0.04 : 0),
      pressure: { value: 1012, unit: 'MB' },
      rainVolume: vol(hour % 24 < 6 ? 0.04 : 0),
      snowVolume: vol(0),
      sunshineDuration: hour % 24 > 8 && hour % 24 < 16 ? 3600 : 0,
      temp: t(60 + (hour % 12)),
      time: midnight + hour * HOUR,
      uvIndex: hour % 24 > 8 ? 4 : 0,
      visibility: { value: 8, unit: 'MI' },
      windGust: speed(12, 190),
      windspeed: speed(7, 190),
    })),
  };
};

/**
 * Stub the weather API and Nominatim, freeze Date at a fixed time, then visit.
 * `weather` overrides the API reply; pass a StaticResponse such as `{ statusCode: 500 }` to fail it.
 * `weatherDelay` holds back the default reply so loading states can be observed.
 * `alerts` overrides the alerts reply (an AlertsResponse body or a StaticResponse).
 * `languages` pins `navigator.languages` so locale-derived defaults don't depend on the test machine.
 * @param {{ path?: string, now?: number, onBeforeLoad?: (win: Window) => void, weather?: object, weatherDelay?: number, alerts?: object, languages?: string[] }} [opts]
 */
const visitStubbed = ({
  path = '/',
  now = fixedNow(),
  onBeforeLoad,
  weather,
  weatherDelay = 0,
  alerts = { coverage: true, sources: ['NWS'], alerts: [] },
  languages = ['en-US'],
} = {}) => {
  cy.intercept('GET', '**/alerts/**', alerts).as('alerts');
  cy.intercept('GET', '**/weather/**', (req) => {
    const unit = /\/unit\/METRIC/i.test(req.url) ? 'METRIC' : 'IMPERIAL';
    req.reply(weather ?? { body: buildWeather(now, unit), delay: weatherDelay });
  }).as('weather');
  cy.intercept('GET', 'https://nominatim.openstreetmap.org/search*', (req) => {
    req.reply(PLACES[req.query.postalcode] ?? []);
  }).as('geocode');
  cy.intercept('GET', 'https://nominatim.openstreetmap.org/reverse*', REVERSE).as('reverse');
  cy.clock(now, ['Date']);
  cy.visit(path, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'languages', { value: languages, configurable: true });
      Object.defineProperty(win.navigator, 'language', { value: languages[0], configurable: true });
      onBeforeLoad?.(win);
    },
  });
  return now;
};

// The app may fire duplicate requests on load, so match against every call rather than the next one.
const expectRequest = (alias, test, label = `a matching ${alias} request`) =>
  cy.get(`@${alias}.all`).should((calls) => {
    expect(calls.some(({ request }) => test(request)), label).to.be.true;
  });

/** Yields the parsed `preferences` object from localStorage. */
const savedPreferences = () =>
  cy.window().then((win) => JSON.parse(win.localStorage.getItem('preferences') || '{}'));

module.exports = {
  DAY,
  HOUR,
  PLACES,
  REVERSE,
  buildWeather,
  expectRequest,
  fixedNow,
  savedPreferences,
  visitStubbed,
};
