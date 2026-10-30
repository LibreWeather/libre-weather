import { useMemo } from 'react';

import { WEATHER_API_ROOT, weatherRequest, type WeatherPart } from '@/api/weather';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import type { LoadStatus } from '@/models/status';
import type { Current, CurrentDay, Daily, Hourly } from '@/models/weather';
import { CURRENT_REFRESH_MS, DAILY_REFRESH_MS, HOURLY_REFRESH_MS } from '@/utilities/refresh';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

type Slice<T> = {
  data: T | null;
  status: LoadStatus;
  stale: boolean;
  retry: () => void;
};

const logWarning = (error: Error) => console.warn(error);

const useWeatherRequest = (part: WeatherPart) => {
  const { coords } = usePlace();
  const {
    resolved: { unitSystem: units },
  } = usePreferences();
  const blocked = Boolean(coords && !WEATHER_API_ROOT);
  const request = coords && WEATHER_API_ROOT ? weatherRequest(coords, units, part) : null;
  return { request, blocked };
};

const useSlice = <T>(part: WeatherPart, intervalMs: number): Slice<T> => {
  const { request, blocked } = useWeatherRequest(part);
  const slice = useAutoRefresh<T>(request, { intervalMs, onError: logWarning });
  const { data, retry, stale } = slice;
  const status: LoadStatus = blocked ? 'error' : slice.status;
  return useMemo(() => ({ data, status, stale, retry }), [data, status, stale, retry]);
};

export const useCurrentData = () => {
  const slice = useSlice<{ current: Current }>('current', CURRENT_REFRESH_MS);
  const current = slice.data?.current ?? null;
  const value = useMemo(
    () => ({ current, status: slice.status, stale: slice.stale, retry: slice.retry }),
    [current, slice.status, slice.stale, slice.retry]
  );
  const day = useMemo<CurrentDay>(
    () => ({ sunrise: current?.sunrise ?? 0, sunset: current?.sunset ?? 0, time: current?.time ?? 0 }),
    [current]
  );
  return { value, day };
};

export const useHourlyData = () => {
  const slice = useSlice<{ hourly: Hourly[] }>('hourly', HOURLY_REFRESH_MS);
  const hourly = slice.data?.hourly ?? null;
  return useMemo(
    () => ({ hourly, status: slice.status, stale: slice.stale, retry: slice.retry }),
    [hourly, slice.status, slice.stale, slice.retry]
  );
};

export const useDailyData = () => {
  const slice = useSlice<{ daily: Daily[] }>('daily', DAILY_REFRESH_MS);
  const daily = slice.data?.daily ?? null;
  return useMemo(
    () => ({ daily, status: slice.status, stale: slice.stale, retry: slice.retry }),
    [daily, slice.status, slice.stale, slice.retry]
  );
};
