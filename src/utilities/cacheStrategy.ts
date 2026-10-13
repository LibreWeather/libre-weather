/**
 * Build assets to download at install. Only Latin font subsets are included; the browser asks for other
 * scripts' subsets just when a page uses those characters, and they're cached then.
 * @param {string[]} manifest every asset in the build
 * @returns {string[]}
 */
export const precacheList = (manifest: string[]) =>
  manifest.filter((url) => !url.endsWith('.woff2') || url.includes('-latin-'));

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
