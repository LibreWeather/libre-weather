import React from 'react';

import type { LoadStatus } from '@/models/status';
import type { Weather } from '@/models/weather';
import { convertWeather } from '@/utilities/convertUnits';
import { useCurrent, useDaily, useHourly } from './ForecastProviders';
import { usePreferences } from './PreferencesProvider';

export type WeatherViewData = {
  weather: Weather | null;
  status: LoadStatus;
  hourlyStatus: LoadStatus;
  dailyStatus: LoadStatus;
  retry: () => void;
};

/** Merged forecast for the page. Each slice still loads and refreshes in its own provider. */
export const useWeather = (): WeatherViewData => {
  const currentSlice = useCurrent();
  const hourlySlice = useHourly();
  const dailySlice = useDaily();
  const {
    resolved: { windUnit, volumeUnit },
  } = usePreferences();

  const weather = React.useMemo(() => {
    if (!currentSlice.current) return null;
    return convertWeather(
      {
        current: currentSlice.current,
        hourly: hourlySlice.hourly ?? [],
        daily: dailySlice.daily ?? [],
      },
      { wind: windUnit, volume: volumeUnit }
    );
  }, [currentSlice, hourlySlice, dailySlice, windUnit, volumeUnit]);

  const retry = React.useCallback(() => {
    currentSlice.retry();
    hourlySlice.retry();
    dailySlice.retry();
  }, [currentSlice, hourlySlice, dailySlice]);

  return {
    weather,
    status: currentSlice.status,
    hourlyStatus: hourlySlice.status,
    dailyStatus: dailySlice.status,
    retry,
  };
};
