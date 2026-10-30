import type { FetchRequest } from '@/models/fetch';
import type { Coords } from '@/models/place';
import type { UnitSystem } from '@/models/weather';

export const WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

export type WeatherPart = 'current' | 'hourly' | 'daily';

/**
 * One slice of the forecast. `cache: 'reload'` skips the browser cache so each poll reaches the API.
 * The API then serves current for 15 minutes, hourly for 45 minutes, and daily for 6 hours.
 * @param {Coords} coords
 * @param {UnitSystem} units
 * @param {WeatherPart} part
 * @param {string} [root]
 * @returns {FetchRequest}
 */
export const weatherRequest = (
  { lat, lon }: Coords,
  units: UnitSystem,
  part: WeatherPart,
  root = WEATHER_API_ROOT
): FetchRequest => ({
  url: `${root}/${lat},${lon}/unit/${units}/${part}`,
  init: {
    cache: 'reload',
    headers: { 'x-tz': Intl.DateTimeFormat().resolvedOptions().timeZone },
  },
});
