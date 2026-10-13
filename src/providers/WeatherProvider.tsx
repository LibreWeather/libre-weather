import React from 'react';

import { convertWeather } from '../utilities/convertUnits';
import CurrentDayContext from '../utilities/CurrentDayContext';
import type { LoadStatus, Weather } from '../utilities/weatherTypes';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

export type WeatherContextValue = {
  weather: Weather | null;
  status: LoadStatus;
  retry: () => void;
};

const WeatherContext = React.createContext<WeatherContextValue | null>(null);

export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const {
    resolved: { unitSystem: units, windUnit, volumeUnit },
  } = usePreferences();
  const [apiWeather, setWeather] = React.useState<Weather | null>(null);
  const weather = React.useMemo(
    () => (apiWeather ? convertWeather(apiWeather, { wind: windUnit, volume: volumeUnit }) : null),
    [apiWeather, windUnit, volumeUnit]
  );
  const [status, setStatus] = React.useState<LoadStatus>('loading');
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    if (!coords) return undefined;
    if (!LIBRE_WEATHER_API_ROOT) {
      setStatus('error');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');
    fetch(`${LIBRE_WEATHER_API_ROOT}/${coords.lat},${coords.lon}/unit/${units}`, {
      headers: { 'x-tz': Intl.DateTimeFormat().resolvedOptions().timeZone },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Weather) => {
        setWeather(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setStatus('error');
      });

    return () => controller.abort();
  }, [coords, units, attempt]);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

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
