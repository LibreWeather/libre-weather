import { useCallback, useMemo } from 'react';

import { weatherRequest, type WeatherPart } from '@/api/weather';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import type { LoadStatus } from '@/models/status';
import type { Current, CurrentDay, Daily, Hourly } from '@/models/weather';
import { WEATHER_API_ROOT, type Backend } from '@/utilities/backend';
import { convertCurrent, convertDaily, convertHourly } from '@/utilities/convertUnits';
import { CURRENT_REFRESH_MS, DAILY_REFRESH_MS, HOURLY_REFRESH_MS } from '@/utilities/refresh';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

type Slice<T> = {
  data: T | null;
  status: LoadStatus;
  stale: boolean;
  retry: () => void;
  backend: Backend | null;
};

const logWarning = (error: Error) => console.warn(error);

const useWeatherRequest = (part: WeatherPart) => {
  const { coords } = usePlace();
  const { preferences, resolved } = usePreferences();
  const units = resolved.unitSystem;
  const root = WEATHER_API_ROOT;
  const request = coords && root ?
      weatherRequest(coords, units, part, root, { backend: preferences.backend, key: preferences.backendKey }) :
    null;
  const blocked = Boolean(coords && !root);
  return { request, blocked };
};

const useSlice = <T>(part: WeatherPart, intervalMs: number): Slice<T> => {
  const { request, blocked } = useWeatherRequest(part);
  const slice = useAutoRefresh<T>(request, { intervalMs, onError: logWarning });
  const { data, retry, stale, backend } = slice;
  const status: LoadStatus = blocked ? 'error' : slice.status;
  return useMemo(() => ({ data, status, stale, retry, backend }), [data, status, stale, retry, backend]);
};

const usePreferredUnits = () => {
  const {
    resolved: { windUnit, volumeUnit },
  } = usePreferences();
  return useMemo(() => ({ wind: windUnit, volume: volumeUnit }), [windUnit, volumeUnit]);
};

export const useCurrentData = () => {
  const slice = useSlice<{ current: Current }>('current', CURRENT_REFRESH_MS);
  const { wind } = usePreferredUnits();
  const current = useMemo(() => {
    const raw = slice.data?.current ?? null;
    return raw ? convertCurrent(raw, wind) : null;
  }, [slice.data, wind]);
  const value = useMemo(
    () => ({ current, status: slice.status, stale: slice.stale, retry: slice.retry, backend: slice.backend }),
    [current, slice.status, slice.stale, slice.retry, slice.backend]
  );
  const day = useMemo<CurrentDay>(
    () => ({ sunrise: current?.sunrise ?? 0, sunset: current?.sunset ?? 0, time: current?.time ?? 0 }),
    [current]
  );
  return { value, day };
};

export const useHourlyData = () => {
  const slice = useSlice<{ hourly: Hourly[] }>('hourly', HOURLY_REFRESH_MS);
  const units = usePreferredUnits();
  const hourly = useMemo(() => {
    const raw = slice.data?.hourly ?? null;
    return raw ? convertHourly(raw, units) : null;
  }, [slice.data, units]);
  return useMemo(
    () => ({ hourly, status: slice.status, stale: slice.stale, retry: slice.retry, backend: slice.backend }),
    [hourly, slice.status, slice.stale, slice.retry, slice.backend]
  );
};

export const useDailyData = () => {
  const slice = useSlice<{ daily: Daily[] }>('daily', DAILY_REFRESH_MS);
  const units = usePreferredUnits();
  const daily = useMemo(() => {
    const raw = slice.data?.daily ?? null;
    return raw ? convertDaily(raw, units) : null;
  }, [slice.data, units]);
  return useMemo(
    () => ({ daily, status: slice.status, stale: slice.stale, retry: slice.retry, backend: slice.backend }),
    [daily, slice.status, slice.stale, slice.retry, slice.backend]
  );
};
