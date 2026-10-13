import { VolumeUnit, WindUnit, type Volume, type Weather, type WindSpeed } from './weatherTypes';

const METERS_PER_SECOND: Record<WindUnit, number> = {
  [WindUnit.MS]: 1,
  [WindUnit.MPH]: 0.44704,
  [WindUnit.KMH]: 1 / 3.6,
};

const MILLIMETERS: Record<VolumeUnit, number> = {
  [VolumeUnit.MM]: 1,
  [VolumeUnit.IN]: 25.4,
};

const VOLUME_DECIMALS: Record<VolumeUnit, number> = {
  [VolumeUnit.MM]: 1,
  [VolumeUnit.IN]: 2,
};

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

export const convertWind = <T extends WindSpeed | undefined>(wind: T, to: WindUnit): T => {
  if (!wind || wind.unit === to) return wind;
  const magnitude = Number(wind.magnitude);
  if (!Number.isFinite(magnitude)) return { ...wind, unit: to };
  const converted = (magnitude * METERS_PER_SECOND[wind.unit]) / METERS_PER_SECOND[to];
  return { ...wind, magnitude: round(converted, 1), unit: to };
};

export const convertVolume = <T extends Volume | undefined>(volume: T, to: VolumeUnit): T => {
  if (!volume || volume.unit === to) return volume;
  if (volume.value == null || volume.value === '') return { ...volume, unit: to };
  const value = Number(volume.value);
  if (!Number.isFinite(value)) return { ...volume, unit: to };
  const converted = (value * MILLIMETERS[volume.unit]) / MILLIMETERS[to];
  return { ...volume, value: round(converted, VOLUME_DECIMALS[to]), unit: to };
};

/**
 * Re-express every wind speed and precipitation volume in the preferred units. The API only
 * offers whole unit systems, so mixes like °C with mph are converted here.
 * @param {Weather} weather API response
 * @param {{ wind: WindUnit, volume: VolumeUnit }} units preferred units
 * @returns {Weather}
 */
export const convertWeather = (
  weather: Weather,
  { wind, volume }: { wind: WindUnit; volume: VolumeUnit }
): Weather => ({
  ...weather,
  current: { ...weather.current, windspeed: convertWind(weather.current.windspeed, wind) },
  daily: weather.daily.map((day) => ({
    ...day,
    rainVolume: convertVolume(day.rainVolume, volume),
    snowVolume: convertVolume(day.snowVolume, volume),
    windspeed: convertWind(day.windspeed, wind),
    windGust: convertWind(day.windGust, wind),
  })),
  hourly: weather.hourly.map((hour) => ({
    ...hour,
    precipVolume: convertVolume(hour.precipVolume, volume),
    rainVolume: convertVolume(hour.rainVolume, volume),
    snowVolume: convertVolume(hour.snowVolume, volume),
    windspeed: convertWind(hour.windspeed, wind),
    windGust: convertWind(hour.windGust, wind),
  })),
});
