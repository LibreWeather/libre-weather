import type { WeatherPart } from '@/api/weather';
import { Condition, UnitSystem, VisibilityUnit, type Current, type Daily, type Hourly } from '@/models/weather';
import {
  amount,
  asRecord,
  block,
  list,
  localMillis,
  num,
  pressureOf,
  temperature,
  tempRange,
  visibilityFromMeters,
  wind,
  windOrNull,
} from './measures';
import type { DataProvider, DataQuery } from './types';

const ROOT = 'https://api.open-meteo.com/v1';

const HOURLY_VARS = [
  'temperature_2m',
  'relativehumidity_2m',
  'dewpoint_2m',
  'apparent_temperature',
  'pressure_msl',
  'weathercode',
  'cloudcover',
  'precipitation',
  'precipitation_probability',
  'rain',
  'snowfall',
  'windspeed_10m',
  'winddirection_10m',
  'windgusts_10m',
  'uv_index',
  'visibility',
  'sunshine_duration',
].join(',');

const DAILY_VARS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'weathercode',
  'precipitation_sum',
  'precipitation_probability_max',
  'precipitation_hours',
  'rain_sum',
  'snowfall_sum',
  'windspeed_10m_max',
  'windgusts_10m_max',
  'winddirection_10m_dominant',
  'uv_index_max',
  'sunshine_duration',
  'daylight_duration',
].join(',');

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'dew_point_2m',
  'weather_code',
  'pressure_msl',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
].join(',');

const WMO_TEXT: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

const WMO: Record<number, Condition> = {
  0: Condition.CLEAR,
  1: Condition.CLEAR,
  2: Condition.PARTLY_CLOUDY,
  3: Condition.CLOUDY,
  45: Condition.FOG,
  48: Condition.FOG,
  51: Condition.RAIN,
  53: Condition.RAIN,
  55: Condition.RAIN,
  56: Condition.SLEET,
  57: Condition.SLEET,
  61: Condition.RAIN,
  63: Condition.RAIN,
  65: Condition.RAIN,
  66: Condition.SLEET,
  67: Condition.SLEET,
  71: Condition.SNOW,
  73: Condition.SNOW,
  75: Condition.SNOW,
  77: Condition.SNOW,
  80: Condition.RAIN,
  81: Condition.RAIN,
  82: Condition.RAIN,
  85: Condition.SNOW,
  86: Condition.SNOW,
  95: Condition.RAIN,
  96: Condition.RAIN,
  99: Condition.RAIN,
};

const condition = (code: unknown) => WMO[Number(code)] ?? Condition.CLOUDY;
const describe = (code: unknown) => WMO_TEXT[Number(code)] ?? '';

/** Open-Meteo forecast URL for one slice. Units are requested so values are not converted twice. */
export const openMeteoUrl = ({ coords, units, part, tz }: DataQuery) => {
  const imperial = units === UnitSystem.IMPERIAL;
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    temperature_unit: imperial ? 'fahrenheit' : 'celsius',
    windspeed_unit: imperial ? 'mph' : 'ms',
    precipitation_unit: imperial ? 'inch' : 'mm',
    timezone: tz,
  });
  if (part === 'current') {
    params.set('current', CURRENT_VARS);
    params.set('daily', 'sunrise,sunset');
    params.set('forecast_days', '1');
  } else if (part === 'hourly') params.set('hourly', HOURLY_VARS);
  else if (part === 'daily') params.set('daily', DAILY_VARS);
  else {
    params.set('current_weather', 'true');
    params.set('hourly', HOURLY_VARS);
    params.set('daily', DAILY_VARS);
  }
  return `${ROOT}/forecast?${params.toString()}`;
};

const mapCurrent = (data: Record<string, unknown>, units: UnitSystem): Current => {
  const cur = block(data.current);
  const daily = block(data.daily);
  const code = cur.weather_code;
  return {
    apparentTemp: temperature(cur.apparent_temperature, units),
    condition: condition(code),
    description: describe(code),
    dewPoint: temperature(cur.dew_point_2m, units),
    humidity: num(cur.relative_humidity_2m),
    pressure: pressureOf(cur.pressure_msl),
    sunrise: localMillis(list(daily, 'sunrise')[0]),
    sunset: localMillis(list(daily, 'sunset')[0]),
    time: localMillis(cur.time),
    temp: temperature(cur.temperature_2m, units),
    uvIndex: num(cur.uv_index),
    // The current block has cloud cover, not a visibility distance.
    visibility: { unit: VisibilityUnit.Percent, value: num(cur.cloud_cover) },
    windspeed: wind(cur.wind_speed_10m, cur.wind_direction_10m, units),
  };
};

const mapHourly = (data: Record<string, unknown>, units: UnitSystem): Hourly[] => {
  const hourly = block(data.hourly);
  const times = list(hourly, 'time');
  const out: Hourly[] = [];
  for (let hour = 0; hour < times.length && out.length < 168; hour += 1) {
    const code = list(hourly, 'weathercode')[hour];
    const direction = list(hourly, 'winddirection_10m')[hour];
    const gust = list(hourly, 'windgusts_10m')[hour];
    out.push({
      apparentTemp: temperature(list(hourly, 'apparent_temperature')[hour], units),
      cloudCover: num(list(hourly, 'cloudcover')[hour]),
      condition: condition(code),
      description: describe(code),
      dewPoint: temperature(list(hourly, 'dewpoint_2m')[hour], units),
      humidity: num(list(hourly, 'relativehumidity_2m')[hour]),
      precipProbability: num(list(hourly, 'precipitation_probability')[hour]),
      precipVolume: amount(list(hourly, 'precipitation')[hour], units),
      pressure: pressureOf(list(hourly, 'pressure_msl')[hour]),
      rainVolume: amount(list(hourly, 'rain')[hour], units),
      snowVolume: amount(list(hourly, 'snowfall')[hour], units),
      sunshineDuration: num(list(hourly, 'sunshine_duration')[hour]),
      temp: temperature(list(hourly, 'temperature_2m')[hour], units),
      time: localMillis(times[hour]),
      uvIndex: num(list(hourly, 'uv_index')[hour]),
      visibility: visibilityFromMeters(list(hourly, 'visibility')[hour], units),
      windGust: windOrNull(gust, direction, units) ?? undefined,
      windspeed: wind(list(hourly, 'windspeed_10m')[hour], direction, units),
    });
  }
  return out;
};

const mapDaily = (data: Record<string, unknown>, units: UnitSystem): Daily[] => {
  const daily = block(data.daily);
  const times = list(daily, 'time');
  const out: Daily[] = [];
  for (let day = 0; day < times.length && out.length < 7; day += 1) {
    const code = list(daily, 'weathercode')[day];
    const direction = list(daily, 'winddirection_10m_dominant')[day];
    const gust = list(daily, 'windgusts_10m_max')[day];
    out.push({
      apparentTemp: tempRange(
        list(daily, 'apparent_temperature_min')[day],
        list(daily, 'apparent_temperature_max')[day],
        units
      ),
      condition: condition(code),
      description: describe(code),
      daylightDuration: num(list(daily, 'daylight_duration')[day]),
      precipHours: num(list(daily, 'precipitation_hours')[day]),
      precipProbability: num(list(daily, 'precipitation_probability_max')[day]),
      rainVolume: amount(list(daily, 'rain_sum')[day], units),
      snowVolume: amount(list(daily, 'snowfall_sum')[day], units),
      sunrise: localMillis(list(daily, 'sunrise')[day]),
      sunshineDuration: num(list(daily, 'sunshine_duration')[day]),
      sunset: localMillis(list(daily, 'sunset')[day]),
      temp: tempRange(list(daily, 'temperature_2m_min')[day], list(daily, 'temperature_2m_max')[day], units),
      time: localMillis(times[day]),
      uvIndex: num(list(daily, 'uv_index_max')[day]),
      windGust: windOrNull(gust, direction, units) ?? undefined,
      windspeed: wind(list(daily, 'windspeed_10m_max')[day], direction, units),
    });
  }
  return out;
};

const parsePart = (part: WeatherPart, body: unknown, units: UnitSystem) => {
  const data = asRecord(body, 'Open-Meteo');
  if (part === 'current') {
    if (!data.current) throw new Error('Current forecast missing');
    return { current: mapCurrent(data, units) };
  }
  if (part === 'hourly') {
    if (!data.hourly) throw new Error('Hourly forecast missing');
    return { hourly: mapHourly(data, units) };
  }
  if (!data.daily) throw new Error('Daily forecast missing');
  return { daily: mapDaily(data, units) };
};

/** Open-Meteo allows browser calls and needs no key. */
const openMeteo: DataProvider = {
  id: 'open-meteo',

  ready() {
    return true;
  },

  request(query) {
    return { url: openMeteoUrl(query), init: { cache: 'reload' } };
  },

  parse(part, body, units) {
    return parsePart(part, body, units);
  },
};

export default openMeteo;
