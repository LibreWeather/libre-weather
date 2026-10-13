export type CacheStrategy = 'app-shell' | 'cache-first' | 'network-first' | 'passthrough';

const NOMINATIM_ORIGIN = 'https://nominatim.openstreetmap.org';

/**
 * Decide how the service worker should answer a request.
 * @param {Request} request outgoing request
 * @param {string} origin origin the app is served from
 * @param {string} [apiRoot] weather API root, e.g. https://api.libreweather.com/weather
 * @returns {CacheStrategy} strategy to apply
 */
export const strategyFor = (
  request: Pick<Request, 'method' | 'mode' | 'url'>,
  origin: string,
  apiRoot?: string
): CacheStrategy => {
  if (request.method !== 'GET') return 'passthrough';
  if (request.mode === 'navigate') return 'app-shell';

  const url = new URL(request.url);
  if (apiRoot && request.url.startsWith(`${apiRoot}/`)) return 'network-first';
  if (url.origin === NOMINATIM_ORIGIN) return 'network-first';
  if (url.origin === origin) return 'cache-first';
  return 'passthrough';
};
