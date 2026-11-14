import { useCallback, useEffect, useRef, useState } from 'react';

import { useFetch, type ExecuteOptions } from '@/hooks/useFetch';
import type { FetchRequest } from '@/models/fetch';
import type { LoadStatus } from '@/models/status';

type RefreshClockOptions = {
  enabled?: boolean;
  intervalMs: number;
  /** Restarts the wait. Pass the request identity so a fresh load is not fetched again immediately. */
  resetKey?: string | null;
};

type AutoRefreshOptions<T> = {
  intervalMs: number;
  /** Reload without clearing the previous response. */
  keepPreviousData?: boolean;
  onError?: (error: Error) => void;
  /** Map a provider payload into the forecast model before it is stored. */
  parse?: (body: unknown) => T;
};

export type AutoRefresh<T> = {
  data: T | null;
  status: LoadStatus;
  /** Last good response is older than twice the refresh interval. */
  stale: boolean;
  retry: () => void;
};

const statusOf = (loading: boolean, error: Error | null, hasData: boolean): LoadStatus => {
  if (loading && !hasData) return 'loading';
  if (error && !hasData) return 'error';
  if (loading) return 'loading';
  if (hasData) return 'ready';
  return 'idle';
};

const requestKey = (request: string | FetchRequest | null) => {
  if (request == null) return null;
  return typeof request === 'string' ? request : JSON.stringify(request);
};

/**
 * Call `refresh` on a wall-clock interval. Hidden tabs stall timers, so becoming visible after the
 * interval has already elapsed refreshes immediately instead of waiting out another full period.
 */
const useRefreshClock = (refresh: () => void, options: RefreshClockOptions) => {
  const { enabled = true, intervalMs, resetKey = null } = options;
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return undefined;

    let timer = 0;
    let last = Date.now();

    const arm = () => {
      window.clearTimeout(timer);
      const wait = Math.max(0, intervalMs - (Date.now() - last));
      timer = window.setTimeout(tick, wait);
    };

    const tick = () => {
      if (Date.now() - last < intervalMs) {
        arm();
        return;
      }
      last = Date.now();
      refreshRef.current();
      arm();
    };

    const onVisible = () => {
      if (document.visibilityState === 'hidden') return;
      tick();
    };

    arm();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
    };
  }, [enabled, intervalMs, resetKey]);
};

/**
 * Fetch `request` and keep refreshing it. Each provider calls this once and publishes the result.
 * @param {string | FetchRequest | null} request `null` means there is nothing to load yet
 * @param {AutoRefreshOptions} options
 * @returns {AutoRefresh<T>}
 */
export const useAutoRefresh = <T>(
  request: string | FetchRequest | null,
  options: AutoRefreshOptions<T>
): AutoRefresh<T> => {
  const { intervalMs, keepPreviousData = true, onError, parse } = options;
  const [{ data, loading, error }, refetch] = useFetch<T>(request, { keepPreviousData, onError, parse });
  const key = requestKey(request);
  // Keep the last success on screen when a refresh fails or the request is briefly empty.
  const [held, setHeld] = useState<T | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (data == null) return;
    setHeld(data);
    setFetchedAt(Date.now());
  }, [data]);

  useEffect(() => {
    if (fetchedAt == null) return undefined;
    const limit = intervalMs * 2;
    const mark = () => setStale(Date.now() - fetchedAt >= limit);
    mark();
    const timer = window.setTimeout(mark, Math.max(0, fetchedAt + limit - Date.now()));
    const onVisible = () => {
      if (document.visibilityState !== 'hidden') mark();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchedAt, intervalMs]);

  const reload = useCallback((execOptions?: ExecuteOptions) => {
    refetch(undefined, execOptions);
  }, [refetch]);

  useRefreshClock(() => {
    reload({ background: true });
  }, { enabled: key != null, intervalMs, resetKey: key });

  const retry = useCallback(() => {
    reload();
  }, [reload]);

  return { data: held, status: statusOf(loading, error, held != null), stale, retry };
};
