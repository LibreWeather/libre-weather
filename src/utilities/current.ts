import type { Weather } from '@/models/weather';
import { pressureDisplay, tempDisplay, visibilityDisplay, windDisplay } from './formatters';

/** The hero's readings, formatted for display. */
export const currentConditions = ({ current, daily }: Weather) => ({
  condition: current.condition,
  description: current.description ? `${current.description}.` : null,
  dewPoint: tempDisplay(current.dewPoint),
  humidity: Math.round(current.humidity),
  pressure: pressureDisplay(current.pressure),
  summary: current.summary?.length ? `${current.summary}.` : null,
  temp: tempDisplay(current.temp),
  tempFeelsLike: tempDisplay(current.apparentTemp),
  tempMax: tempDisplay(daily[0]?.temp.max),
  tempMin: tempDisplay(daily[0]?.temp.min),
  uvIndex: Math.round(Number(current.uvIndex)),
  visibility: visibilityDisplay(current.visibility),
  windDeg: Number(current.windspeed.direction),
  windSpeed: windDisplay(current.windspeed),
});
