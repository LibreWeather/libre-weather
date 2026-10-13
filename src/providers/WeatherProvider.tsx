import React from 'react';

import CurrentDayContext from '../utilities/CurrentDayContext';
import { browserUnits } from '../utilities/localeUnits';
import { UnitSystem, type LoadStatus, type Weather } from '../utilities/weatherTypes';
import { usePlace } from './PlaceProvider';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

export type WeatherContextValue = {
  weather: Weather | null;
  status: LoadStatus;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  retry: () => void;
};

const WeatherContext = React.createContext<WeatherContextValue | null>(null);

export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const [units, setUnitsState] = React.useState<UnitSystem>(
    () => (localStorage.getItem('units') as UnitSystem) || browserUnits()
  );
  const [weather, setWeather] = React.useState<Weather | null>(null);
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

  const setUnits = React.useCallback((next: UnitSystem) => {
    localStorage.setItem('units', next);
    setUnitsState(next);
  }, []);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

  const value = React.useMemo<WeatherContextValue>(
    () => ({ weather, status, units, setUnits, retry }),
    [weather, status, units, setUnits, retry]
  );

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
