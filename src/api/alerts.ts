import type { Coords } from '@/models/place';

/**
 * Alerts endpoint root. Defaults to a sibling of the weather endpoint, e.g.
 * https://api.libreweather.com/weather -> https://api.libreweather.com/alerts
 * @param {string} [weatherRoot] weather API root
 * @param {string} [override] explicit alerts API root
 * @returns {string | undefined} alerts API root without a trailing slash
 */
export const alertsRoot = (weatherRoot?: string, override?: string) => {
  if (override) return override.replace(/\/$/, '');
  if (!weatherRoot) return undefined;
  return new URL('../alerts', `${weatherRoot.replace(/\/$/, '')}/`).href.replace(/\/$/, '');
};

export const ALERTS_API_ROOT = alertsRoot(process.env.LIBRE_WEATHER_API, process.env.LIBRE_WEATHER_ALERTS_API);

export const alertsRequest = ({ lat, lon }: Coords, root = ALERTS_API_ROOT) => `${root}/${lat},${lon}`;
