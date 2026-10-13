import { strategyFor } from '@/utilities/cacheStrategy';

const ORIGIN = 'https://libreweather.com';
const API = 'https://api.libreweather.com/weather';

const req = (url: string, init: Partial<Pick<Request, 'method' | 'mode'>> = {}) => ({
  url,
  method: init.method ?? 'GET',
  mode: init.mode ?? 'cors',
});

describe('strategyFor', () => {
  test('serves page navigations from the app shell', () => {
    expect(strategyFor(req(`${ORIGIN}/licenses`, { mode: 'navigate' }), ORIGIN, API)).toBe('app-shell');
  });

  test('caches built assets first', () => {
    expect(strategyFor(req(`${ORIGIN}/index.1a2b3c.js`), ORIGIN, API)).toBe('cache-first');
  });

  test('fetches weather from the network, falling back to cache', () => {
    expect(strategyFor(req(`${API}/39.1,-94.5/unit/IMPERIAL`), ORIGIN, API)).toBe('network-first');
  });

  test('fetches geocoding from the network, falling back to cache', () => {
    expect(strategyFor(req('https://nominatim.openstreetmap.org/search?postalcode=64106'), ORIGIN, API)).toBe(
      'network-first'
    );
  });

  test('leaves other requests alone', () => {
    expect(strategyFor(req(`${ORIGIN}/thing`, { method: 'POST' }), ORIGIN, API)).toBe('passthrough');
    expect(strategyFor(req('https://example.com/a.js'), ORIGIN, API)).toBe('passthrough');
    expect(strategyFor(req('https://api.libreweather.com/weatherish'), ORIGIN, API)).toBe('passthrough');
  });

  test('does not treat the API specially when it is not configured', () => {
    expect(strategyFor(req(`${API}/1,2/unit/METRIC`), ORIGIN)).toBe('passthrough');
  });
});
