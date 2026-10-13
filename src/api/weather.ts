import type { FetchRequest } from '@/models/fetch';
import type { Coords } from '@/models/place';
import type { UnitSystem } from '@/models/weather';

export const WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

/** Forecast for a point; `x-tz` makes the API bucket days in the browser's time zone. */
export const weatherRequest = ({ lat, lon }: Coords, units: UnitSystem, root = WEATHER_API_ROOT): FetchRequest => ({
  url: `${root}/${lat},${lon}/unit/${units}`,
  init: { headers: { 'x-tz': Intl.DateTimeFormat().resolvedOptions().timeZone } },
});
