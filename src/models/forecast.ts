import type { Condition, Temperature } from './weather';

export type Precipitation = { type: 'Rain' | 'Snow'; value: string };

/** One row of the weekly forecast, with its times already formatted. */
export type ForecastDay = {
  condition: Condition;
  description: string;
  minTemp: Temperature;
  maxTemp: Temperature;
  precipitation: Precipitation;
  sunrise: string;
  sunset: string;
  time: number;
};

export type OverviewHour = { condition: Condition; time: number; temp: string };

/** A run of hours in the 24-hour strip sharing one condition. */
export type OverviewBar = {
  hrCnt: number;
  condition: Condition;
  /** Hour whose icon represents the run. */
  time: number;
  startTime: number;
  endTime: number;
};
