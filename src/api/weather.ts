import type { FetchRequest } from '@/models/fetch';
import type { Coords } from '@/models/place';
import type { UnitSystem } from '@/models/weather';
import { WEATHER_API_ROOT, backendNeedsKey, type BackendPref } from '@/utilities/backend';

export type WeatherPart = 'current' | 'hourly' | 'daily';

/**
 * One slice of the forecast. `cache: 'reload'` skips the browser cache so each poll reaches the API.
 * The API then serves current for 15 minutes, hourly for 45 minutes, and daily for 6 hours.
 * @param {Coords} coords
 * @param {UnitSystem} units
 * @param {WeatherPart} part
 * @param {string} [root] LibreWeather API address. Defaults to `WEATHER_API_ROOT`.
 * @param {{ backend?: BackendPref, key?: string }} [choice] saved backend override
 * @returns {FetchRequest}
 */
export const weatherRequest = (
  { lat, lon }: Coords,
  units: UnitSystem,
  part: WeatherPart,
  root = WEATHER_API_ROOT,
  choice?: { backend?: BackendPref; key?: string }
): FetchRequest => {
  const headers: Record<string, string> = {
    'x-tz': Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  if (choice?.backend) headers['x-backend'] = choice.backend;
  const key = choice?.key?.trim() ?? '';
  if (choice?.backend && backendNeedsKey(choice.backend) && key && !/\s/.test(key)) {
    headers['x-backend-key'] = key;
  }
  return {
    url: `${root}/${lat},${lon}/unit/${units}/${part}`,
    init: { cache: 'reload', headers },
  };
};
