import { alertsRoot } from '../utilities/alertTypes';

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
