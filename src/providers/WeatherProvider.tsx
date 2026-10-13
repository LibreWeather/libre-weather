import React from 'react';

import { WEATHER_API_ROOT, weatherRequest } from '@/api/weather';
import { useFetch } from '@/hooks/useFetch';
import type { LoadStatus } from '@/models/status';
import type { Weather } from '@/models/weather';
import { convertWeather } from '@/utilities/convertUnits';
import CurrentDayContext from './CurrentDayContext';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

export type WeatherContextValue = {
  weather: Weather | null;
  status: LoadStatus;
  retry: () => void;
};

const WeatherContext = React.createContext<WeatherContextValue | null>(null);

const logError = (error: Error) => console.error(error);

export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const {
    resolved: { unitSystem: units, windUnit, volumeUnit },
  } = usePreferences();
  const request = coords && WEATHER_API_ROOT ? weatherRequest(coords, units) : null;
  // Kept while reloading so the page dims instead of dropping back to the skeleton.
  const [{ data, loading, error }, refetch] = useFetch<Weather>(request, { keepPreviousData: true, onError: logError });
  const weather = React.useMemo(
    () => (data ? convertWeather(data, { wind: windUnit, volume: volumeUnit }) : null),
    [data, windUnit, volumeUnit]
  );

  let status: LoadStatus = 'idle';
  if (error || (coords && !WEATHER_API_ROOT)) status = 'error';
  else if (loading) status = 'loading';
  else if (data) status = 'ready';

  const retry = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const value = React.useMemo<WeatherContextValue>(() => ({ weather, status, retry }), [weather, status, retry]);

  const currentDay = React.useMemo(
    () => ({
      sunrise: weather?.current.sunrise ?? 0,
      sunset: weather?.current.sunset ?? 0,
      time: weather?.current.time ?? 0,
    }),
    [weather]
  );

  return (
    <WeatherContext.Provider value={value}>
      <CurrentDayContext.Provider value={currentDay}>{children}</CurrentDayContext.Provider>
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = React.useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used inside a WeatherProvider');
  return context;
};
