import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FetchRequest } from '@/models/fetch';

export type FetchState<T> = { data: T | null; loading: boolean; error: Error | null };

export type FetchOptions<T> = {
  /** Only fetch when `execute` is called. */
  manual?: boolean;
  /** Keep the last response while a new request loads, instead of clearing it. */
  keepPreviousData?: boolean;
  onError?: (error: Error) => void;
  /** Turn the JSON body into `T`. Runs when the response arrives, not when the request is built. */
  parse?: (body: unknown) => T;
};

export type ExecuteOptions = {
  /** Reload without a loading flag. A failure leaves the response already on screen. */
  background?: boolean;
};

const toRequest = (request: string | FetchRequest): FetchRequest =>
  typeof request === 'string' ? { url: request } : request;

/**
 * JSON fetching in the style of axios-hooks, on native `fetch`.
 * Fetches whenever `request` changes, aborting the previous one; `null` means there's nothing to fetch yet.
 * `execute` re-sends the request (or another one) and resolves to its data, or `null` when it failed or was
 * superseded; errors land in state and `onError` rather than rejecting. `background` keeps the current
 * screen up: no loading flag, and a failure does not replace a good response.
 * @param {string | FetchRequest | null} request URL or URL plus `fetch` options
 * @param {FetchOptions} [options]
 * @returns {[FetchState<T>, (request?: string | FetchRequest) => Promise<T | null>, () => void]}
 */
export const useFetch = <T>(request: string | FetchRequest | null, options: FetchOptions<T> = {}) => {
  const { manual = false, keepPreviousData = false, onError, parse } = options;
  const key = request ? JSON.stringify(toRequest(request)) : null;
  const stable = useMemo<FetchRequest | null>(() => (key ? JSON.parse(key) : null), [key]);
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: !manual && key != null, error: null });
  const controller = useRef<AbortController | null>(null);
  const onErrorRef = useRef(onError);
  const parseRef = useRef(parse);

  useEffect(() => {
    onErrorRef.current = onError;
    parseRef.current = parse;
  }, [onError, parse]);

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
  }, []);

  const execute = useCallback(
    async (override?: string | FetchRequest, execOptions?: ExecuteOptions): Promise<T | null> => {
      const target = override ? toRequest(override) : stable;
      const background = execOptions?.background ?? false;
      if (!target) return null;
      cancel();
      const current = new AbortController();
      controller.current = current;
      if (!background) setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const res = await fetch(target.url, { ...target.init, signal: current.signal });
        const reported = target.errorUrl ?? target.url;
        if (!res.ok) throw new Error(`Request to ${reported} failed: ${res.status} ${res.statusText}`);
        const body: unknown = await res.json();
        const data = (parseRef.current ? parseRef.current(body) : body) as T;
        if (current.signal.aborted) return null;
        setState({ data, loading: false, error: null });
        return data;
      } catch (caught) {
        if (current.signal.aborted) return null;
        const error = caught instanceof Error ? caught : new Error(String(caught));
        setState((previous) =>
          background && previous.data != null ? { ...previous, loading: false } : { ...previous, loading: false, error }
        );
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
