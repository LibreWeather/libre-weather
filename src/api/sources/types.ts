import type { DataSourceId, DataSourcePref } from '@/models/dataSource';
import type { FetchRequest } from '@/models/fetch';
import type { Coords } from '@/models/place';
import type { UnitSystem } from '@/models/weather';
import type { WeatherPart } from '@/api/weather';

export type DataChoice = {
  source: DataSourcePref;
  pirateWeatherKey: string;
};

export type DataConfig = {
  apiRoot?: string;
};

export type DataQuery = {
  coords: Coords;
  units: UnitSystem;
  part: WeatherPart;
  tz: string;
};

export type DataProvider = {
  id: DataSourceId;
  /** False when a required root or key is missing. */
  ready(choice: DataChoice, config: DataConfig): boolean;
  request(query: DataQuery, choice: DataChoice, config: DataConfig): FetchRequest | null;
  parse(part: WeatherPart, body: unknown, units: UnitSystem): unknown;
};
