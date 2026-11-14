import type { DataSourceId } from '@/models/dataSource';
import libre from './libre';
import openMeteo from './openMeteo';
import pirateWeather from './pirateWeather';
import type { DataChoice, DataConfig, DataProvider } from './types';

export type { DataChoice, DataConfig, DataProvider, DataQuery } from './types';

/**
 * Browser forecast sources.
 * OpenWeatherMap stays on the LibreWeather API: its key is a server secret and the API blocks browsers.
 * Open-Meteo and Pirate Weather both allow a page to call them directly.
 */
const SOURCES: Record<DataSourceId, DataProvider> = {
  libre,
  'open-meteo': openMeteo,
  'pirate-weather': pirateWeather,
};

/** Read at call time so tests can set `LIBRE_WEATHER_API` before the first request. */
export const dataConfig = (): DataConfig => ({
  apiRoot: process.env.LIBRE_WEATHER_API,
});

/**
 * `auto` keeps the LibreWeather API when one is configured, and otherwise calls Open-Meteo directly.
 * An explicit choice is used even when that source is not ready yet, so a missing key surfaces as an error.
 */
export const resolveDataSource = (choice: DataChoice, config: DataConfig): DataSourceId => {
  if (choice.source !== 'auto') return choice.source;
  if (config.apiRoot) return 'libre';
  return 'open-meteo';
};

export const activeSource = (choice: DataChoice, config: DataConfig = dataConfig()) => {
  const id = resolveDataSource(choice, config);
  const provider = SOURCES[id];
  return { id, provider, ready: provider.ready(choice, config) };
};
