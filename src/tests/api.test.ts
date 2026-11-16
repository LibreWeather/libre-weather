import { alertsRequest, alertsRoot } from '@/api/alerts';
import { geocodeRequest, reverseRequest } from '@/api/nominatim';
import { weatherRequest } from '@/api/weather';
import { UnitSystem } from '@/models/weather';
import { Backend } from '@/utilities/backend';

describe('alertsRoot', () => {
  test('sits next to the weather endpoint', () => {
    expect(alertsRoot('https://api.libreweather.com/weather')).toBe('https://api.libreweather.com/alerts');
    expect(alertsRoot('http://localhost:3000/weather/')).toBe('http://localhost:3000/alerts');
  });

  test('prefers an explicit override', () => {
    expect(alertsRoot('https://api.libreweather.com/weather', 'https://alerts.example.com/v1/')).toBe(
      'https://alerts.example.com/v1'
    );
  });

  test('is undefined without any API configured', () => {
    expect(alertsRoot()).toBeUndefined();
  });
});

describe('request builders', () => {
  test('alerts are fetched per point', () => {
    expect(alertsRequest({ lat: 39.1, lon: -94.58 }, 'https://api.example.com/alerts')).toBe(
      'https://api.example.com/alerts/39.1,-94.58'
    );
  });

  test('weather asks for a unit system and sends the time zone', () => {
    const { url, init } = weatherRequest(
      { lat: 1, lon: 2 },
      UnitSystem.METRIC,
      'current',
      'https://api.example.com/weather'
    );
    expect(url).toBe('https://api.example.com/weather/1,2/unit/METRIC/current');
    expect(init?.cache).toBe('reload');
    expect(init?.headers).toEqual({ 'x-tz': Intl.DateTimeFormat().resolvedOptions().timeZone });
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(weatherRequest({ lat: 1, lon: 2 }, UnitSystem.METRIC, 'current', 'https://api.example.com/weather', {
      backend: Backend.PIRATE,
      key: 'pw-key',
    }).init?.headers).toEqual({ 'x-tz': zone, 'x-backend': 'PIRATE', 'x-backend-key': 'pw-key' });
    expect(weatherRequest({ lat: 1, lon: 2 }, UnitSystem.METRIC, 'current', 'https://api.example.com/weather', {
      backend: Backend.METEO,
      key: 'unused',
    }).init?.headers).toEqual({ 'x-tz': zone, 'x-backend': 'METEO' });
    expect(weatherRequest({ lat: 1, lon: 2 }, UnitSystem.METRIC, 'current', 'https://api.example.com/weather', {
      backend: Backend.OWM,
      key: 'bad key',
    }).init?.headers).toEqual({ 'x-tz': zone, 'x-backend': 'OWM' });
    expect(weatherRequest({ lat: 1, lon: 2 }, UnitSystem.METRIC, 'hourly', 'https://api.example.com/weather').url).toBe(
      'https://api.example.com/weather/1,2/unit/METRIC/hourly'
    );
    expect(weatherRequest({ lat: 1, lon: 2 }, UnitSystem.METRIC, 'daily', 'https://api.example.com/weather').url).toBe(
      'https://api.example.com/weather/1,2/unit/METRIC/daily'
    );
  });

  test('nominatim gets JSON output and booleans as 1/0', () => {
    expect(geocodeRequest('64106')).toBe(
      'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&postalcode=64106'
    );
    expect(reverseRequest(1.5, -2)).toBe(
      'https://nominatim.openstreetmap.org/reverse?format=json&lat=1.5&lon=-2&addressdetails=1'
    );
  });
});
