import type { WeatherPart } from '@/api/weather';
import { Condition, type Current, type Daily, type Hourly, type UnitSystem } from '@/models/weather';
import {
  asRecord,
  block,
  depth,
  imperial,
  list,
  percent,
  pressureOf,
  temperature,
  tempRange,
  unixMillis,
  visibilityFromPirate,
  wind,
  windOrNull,
} from './measures';
import type { DataProvider, DataQuery } from './types';

const ROOT = 'https://api.pirateweather.net/forecast';

const ICONS: Record<string, Condition> = {
  'clear-day': Condition.CLEAR,
  'clear-night': Condition.CLEAR,
  'mostly-clear-day': Condition.CLEAR,
  'mostly-clear-night': Condition.CLEAR,
  'partly-cloudy-day': Condition.PARTLY_CLOUDY,
  'partly-cloudy-night': Condition.PARTLY_CLOUDY,
  cloudy: Condition.CLOUDY,
  'mostly-cloudy-day': Condition.CLOUDY,
  'mostly-cloudy-night': Condition.CLOUDY,
  fog: Condition.FOG,
  rain: Condition.RAIN,
  thunderstorm: Condition.RAIN,
  'possible-rain-day': Condition.RAIN,
  'possible-rain-night': Condition.RAIN,
  snow: Condition.SNOW,
  sleet: Condition.SLEET,
  hail: Condition.SLEET,
  ice: Condition.SLEET,
  mixed: Condition.SLEET,
  wind: Condition.WIND,
};

const condition = (icon: unknown) => ICONS[String(icon)] ?? Condition.CLOUDY;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** Key the forecast URL is allowed to use. Empty or spaced values are not sent. */
export const pirateKey = (value: string) => {
  const key = value.trim();
  return key.length > 0 && !/\s/.test(key) ? key : '';
};

/**
 * One Pirate Weather forecast URL.
 * https://docs.pirateweather.net/en/latest/API/
 * `us` matches imperial; `si` matches metric (m/s wind, mm intensity, cm accumulation).
 */
export const pirateForecastUrl = (key: string, { coords, units, part }: DataQuery) => {
  const params = new URLSearchParams({ units: imperial(units) ? 'us' : 'si', version: '2' });
  if (part === 'current') params.set('exclude', 'minutely,hourly,alerts');
  else if (part === 'hourly') {
    params.set('exclude', 'currently,minutely,daily,alerts');
    params.set('extend', 'hourly');
  } else params.set('exclude', 'currently,minutely,hourly,alerts');
  const query = params.toString();
  const place = `${coords.lat},${coords.lon}`;
  return {
    url: `${ROOT}/${encodeURIComponent(key)}/${place}?${query}`,
    errorUrl: `${ROOT}/***/${place}?${query}`,
  };
};

const point = (value: unknown) => block(value);

const finite = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

/** Hourly rain is liquid accumulation (cm or in). Intensity (mm/h or in/h) fills in when that field is absent. */
const hourRain = (row: Record<string, unknown>, units: UnitSystem) => {
  if (row.liquidAccumulation != null) return depth(row.liquidAccumulation, units, 'cm-or-in');
  if (String(row.precipType) === 'snow') return depth(null, units, 'mm-or-in');
  return depth(row.precipIntensity, units, 'mm-or-in');
};

const mapCurrent = (data: Record<string, unknown>, units: UnitSystem): Current => {
  const cur = point(data.currently);
  const firstDay = point(list(block(data.daily), 'data')[0]);
  return {
    apparentTemp: temperature(cur.apparentTemperature, units),
    condition: condition(cur.icon),
    // Dark Sky only has one label; omit `summary` so the hero does not double it.
    description: text(cur.summary),
    dewPoint: temperature(cur.dewPoint, units),
    humidity: percent(cur.humidity),
    pressure: pressureOf(cur.pressure),
    sunrise: unixMillis(firstDay.sunriseTime),
    sunset: unixMillis(firstDay.sunsetTime),
    temp: temperature(cur.temperature, units),
    time: unixMillis(cur.time),
    uvIndex: finite(cur.uvIndex),
    visibility: visibilityFromPirate(cur.visibility, units),
    windspeed: wind(cur.windSpeed, cur.windBearing, units),
  };
};

const mapHour = (value: unknown, units: UnitSystem): Hourly => {
  const hour = point(value);
  return {
    apparentTemp: temperature(hour.apparentTemperature, units),
    cloudCover: percent(hour.cloudCover),
    condition: condition(hour.icon),
    description: text(hour.summary),
    dewPoint: temperature(hour.dewPoint, units),
    humidity: percent(hour.humidity),
    precipProbability: percent(hour.precipProbability),
    precipVolume: depth(hour.precipIntensity, units, 'mm-or-in'),
    pressure: pressureOf(hour.pressure),
    rainVolume: hourRain(hour, units),
    snowVolume: depth(hour.snowAccumulation, units, 'cm-or-in'),
    sunshineDuration: 0,
    temp: temperature(hour.temperature, units),
    time: unixMillis(hour.time),
    uvIndex: Number.isFinite(Number(hour.uvIndex)) ? Number(hour.uvIndex) : 0,
    visibility: visibilityFromPirate(hour.visibility, units),
    windGust: windOrNull(hour.windGust, hour.windBearing, units) ?? undefined,
    windspeed: wind(hour.windSpeed, hour.windBearing, units),
  };
};

const mapDay = (value: unknown, units: UnitSystem): Daily => {
  const day = point(value);
  const min = day.temperatureMin ?? day.temperatureLow;
  const max = day.temperatureMax ?? day.temperatureHigh;
  const feelsMin = day.apparentTemperatureMin ?? day.apparentTemperatureLow;
  const feelsMax = day.apparentTemperatureMax ?? day.apparentTemperatureHigh;
  return {
    apparentTemp: tempRange(feelsMin, feelsMax, units),
    cloudCover: percent(day.cloudCover),
    condition: condition(day.icon),
    description: text(day.summary),
    dewPoint: temperature(day.dewPoint, units),
    humidity: percent(day.humidity),
    precipProbability: percent(day.precipProbability),
    pressure: pressureOf(day.pressure),
    rainVolume: depth(day.liquidAccumulation, units, 'cm-or-in'),
    snowVolume: depth(day.snowAccumulation, units, 'cm-or-in'),
    sunrise: unixMillis(day.sunriseTime),
    sunset: unixMillis(day.sunsetTime),
    temp: tempRange(min, max, units),
    time: unixMillis(day.time),
    uvIndex: finite(day.uvIndex),
    windGust: windOrNull(day.windGust, day.windBearing, units) ?? undefined,
    windspeed: wind(day.windSpeed, day.windBearing, units),
  };
};

const points = (data: Record<string, unknown>, name: string) => list(block(data[name]), 'data');

const parsePart = (part: WeatherPart, body: unknown, units: UnitSystem) => {
  const data = asRecord(body, 'Pirate Weather');
  if (part === 'current') {
    if (!data.currently) throw new Error('Current forecast missing');
    return { current: mapCurrent(data, units) };
  }
  if (part === 'hourly') {
    const hours = points(data, 'hourly').slice(0, 168).map((hour) => mapHour(hour, units));
    if (!hours.length) throw new Error('Hourly forecast missing');
    return { hourly: hours };
  }
  const days = points(data, 'daily').slice(0, 7).map((day) => mapDay(day, units));
  if (!days.length) throw new Error('Daily forecast missing');
  return { daily: days };
};

/** Pirate Weather is called from the browser. The key comes from preferences, not the repo. */
const pirateWeather: DataProvider = {
  id: 'pirate-weather',

  ready(choice) {
    return Boolean(pirateKey(choice.pirateWeatherKey));
  },

  request(query, choice) {
    const key = pirateKey(choice.pirateWeatherKey);
    if (!key) return null;
    const { url, errorUrl } = pirateForecastUrl(key, query);
    return { url, errorUrl, init: { cache: 'reload' } };
  },

  parse(part, body, units) {
    return parsePart(part, body, units);
  },
};

export default pirateWeather;
