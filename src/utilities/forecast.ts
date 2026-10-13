import type { ForecastDay, Precipitation } from '@/models/forecast';
import type { Hourly, Volume, Weather } from '@/models/weather';
import { timeDisplay, volumeDisplay } from './formatters';
import { DAY } from './time';

export const FORECAST_DAYS = 7;

/** Snow when there's more snow than rain, otherwise rain (zero when neither was reported). */
export const precipitation = (rain: Volume, snow: Volume): Precipitation => {
  if (snow.value != null && (rain.value == null || snow.value > rain.value)) {
    return { type: 'Snow', value: volumeDisplay(snow) };
  }
  return { type: 'Rain', value: volumeDisplay(rain) };
};

export const forecastDays = ({ daily }: Weather): ForecastDay[] =>
  daily.slice(0, FORECAST_DAYS).map((day) => ({
    condition: day.condition,
    description: day.description,
    minTemp: day.temp.min,
    maxTemp: day.temp.max,
    precipitation: precipitation(day.rainVolume, day.snowVolume),
    sunrise: timeDisplay(day.sunrise),
    sunset: timeDisplay(day.sunset),
    time: day.time,
  }));

/** Hours on the same local calendar date as `dayTime`, falling back to the 24 hours from it. */
export const hoursOnDay = (hourly: Hourly[] | undefined, dayTime: number) => {
  const day = new Date(dayTime);
  const sameDate = (time: number) => {
    const at = new Date(time);
    return at.getFullYear() === day.getFullYear() && at.getMonth() === day.getMonth() && at.getDate() === day.getDate();
  };
  const matched = (hourly ?? []).filter((hour) => sameDate(hour.time));
  if (matched.length) return matched;
  return (hourly ?? []).filter((hour) => hour.time >= dayTime && hour.time < dayTime + DAY);
};

/** Coldest low and warmest high across the days, so every row's range shares one scale. */
export const tempBounds = (days: ForecastDay[]) => ({
  min: Math.min(...days.map((day) => Number(day.minTemp.value))),
  max: Math.max(...days.map((day) => Number(day.maxTemp.value))),
});

/** Where `value` sits between `min` and `max`, as a percentage; the middle when the range is empty. */
export const rangePercent = (value: number, min: number, max: number) =>
  max === min ? 50 : ((value - min) / (max - min)) * 100;
