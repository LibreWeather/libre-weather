import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FetchRequest } from '@/models/fetch';

export type FetchState<T> = { data: T | null; loading: boolean; error: Error | null };

export type FetchOptions = {
  /** Only fetch when `execute` is called. */
  manual?: boolean;
  /** Keep the last response while a new request loads, instead of clearing it. */
  keepPreviousData?: boolean;
  onError?: (error: Error) => void;
};

const toRequest = (request: string | FetchRequest): FetchRequest =>
  typeof request === 'string' ? { url: request } : request;

/**
 * JSON fetching in the style of axios-hooks, on native `fetch`.
 * Fetches whenever `request` changes, aborting the previous one; `null` means there's nothing to fetch yet.
 * `execute` re-sends the request (or another one) and resolves to its data, or `null` when it failed or was
 * superseded; errors land in state and `onError` rather than rejecting.
 * @param {string | FetchRequest | null} request URL or URL plus `fetch` options
 * @param {FetchOptions} [options]
 * @returns {[FetchState<T>, (request?: string | FetchRequest) => Promise<T | null>, () => void]}
 */
export const useFetch = <T>(request: string | FetchRequest | null, options: FetchOptions = {}) => {
  const { manual = false, keepPreviousData = false, onError } = options;
  const key = request ? JSON.stringify(toRequest(request)) : null;
  const stable = useMemo<FetchRequest | null>(() => (key ? JSON.parse(key) : null), [key]);
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: !manual && key != null, error: null });
  const controller = useRef<AbortController | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
  }, []);

  const execute = useCallback(
    async (override?: string | FetchRequest): Promise<T | null> => {
      const target = override ? toRequest(override) : stable;
      if (!target) return null;
      cancel();
      const current = new AbortController();
      controller.current = current;
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const res = await fetch(target.url, { ...target.init, signal: current.signal });
        if (!res.ok) throw new Error(`Request to ${target.url} failed: ${res.status} ${res.statusText}`);
        const data = (await res.json()) as T;
        if (current.signal.aborted) return null;
        setState({ data, loading: false, error: null });
        return data;
      } catch (caught) {
        if (current.signal.aborted) return null;
        const error = caught instanceof Error ? caught : new Error(String(caught));
        setState((previous) => ({ ...previous, loading: false, error }));
        onErrorRef.current?.(error);
        return null;
      } finally {
        if (controller.current === current) controller.current = null;
      }
    },
    [stable, cancel]
  );

  useEffect(() => {
    if (manual) return undefined;
    if (!stable) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    if (!keepPreviousData) setState({ data: null, loading: true, error: null });
    execute();
    return cancel;
  }, [stable, manual, keepPreviousData, execute, cancel]);

  useEffect(() => cancel, [cancel]);

  return [state, execute, cancel] as const;
};
