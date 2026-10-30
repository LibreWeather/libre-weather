import { act, renderHook, waitFor } from '@testing-library/react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useFetch } from '@/hooks/useFetch';
import { useStorage } from '@/hooks/useStorage';
import type { StorageCodec } from '@/models/storage';

const respond = (body: unknown, ok = true) =>
  Promise.resolve({ ok, status: ok ? 200 : 500, statusText: ok ? 'OK' : 'Server Error', json: () => Promise.resolve(body) });

describe('useFetch', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('loads, then exposes data', async () => {
    global.fetch = jest.fn(() => respond({ hello: 'world' })) as never;
    const { result } = renderHook(() => useFetch<{ hello: string }>('/api'));
    expect(result.current[0].loading).toBe(true);
    await waitFor(() => expect(result.current[0].data).toEqual({ hello: 'world' }));
    expect(result.current[0].loading).toBe(false);
  });

  test('stays idle without a request, and manual waits for execute', async () => {
    global.fetch = jest.fn(() => respond([1])) as never;
    const idle = renderHook(() => useFetch(null));
    expect(idle.result.current[0]).toEqual({ data: null, loading: false, error: null });
    const manual = renderHook(() => useFetch<number[]>('/api', { manual: true }));
    expect(global.fetch).not.toHaveBeenCalled();
    let data: number[] | null = null;
    await act(async () => {
      data = await manual.result.current[1]();
    });
    expect(data).toEqual([1]);
  });

  test('reports errors without rejecting', async () => {
    global.fetch = jest.fn(() => respond(null, false)) as never;
    const onError = jest.fn();
    const { result } = renderHook(() => useFetch('/api', { onError }));
    await waitFor(() => expect(result.current[0].error).toBeInstanceOf(Error));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('keepPreviousData holds the last response while the next request loads', async () => {
    let resolveSecond: (value: unknown) => void = () => {};
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => respond('first'))
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveSecond = resolve;
      })) as never;
    const { result, rerender } = renderHook(({ url }) => useFetch<string>(url, { keepPreviousData: true }), {
      initialProps: { url: '/a' },
    });
    await waitFor(() => expect(result.current[0].data).toBe('first'));
    rerender({ url: '/b' });
    await waitFor(() => expect(result.current[0].loading).toBe(true));
    expect(result.current[0].data).toBe('first');
    await act(async () => {
      resolveSecond(await respond('second'));
    });
    await waitFor(() => expect(result.current[0].data).toBe('second'));
  });

  test('background refresh keeps the last response when the next request fails', async () => {
    let resolveSecond: (value: unknown) => void = () => {};
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => respond('first'))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          })
      ) as never;
    const { result } = renderHook(() => useFetch<string>('/api'));
    await waitFor(() => expect(result.current[0].data).toBe('first'));
    act(() => {
      result.current[1](undefined, { background: true });
    });
    expect(result.current[0]).toMatchObject({ data: 'first', loading: false, error: null });
    await act(async () => {
      resolveSecond(await respond(null, false));
    });
    expect(result.current[0]).toMatchObject({ data: 'first', loading: false, error: null });
  });
});

describe('useAutoRefresh', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  const flush = async () => {
    await jest.advanceTimersByTimeAsync(0);
  };

  test('loads the request, then refetches on the interval', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => respond({ n: 1 })) as never;
    const { result } = renderHook(() => useAutoRefresh<{ n: number }>('/api', { intervalMs: 1000 }));
    await act(flush);
    expect(result.current).toMatchObject({ data: { n: 1 }, status: 'ready' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(999);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('stays idle without a request, and restarts the wait when the request changes', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => respond('ok')) as never;
    const idle = renderHook(() => useAutoRefresh<string>(null, { intervalMs: 1000 }));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });
    expect(idle.result.current).toMatchObject({ data: null, status: 'idle' });
    expect(global.fetch).not.toHaveBeenCalled();
    idle.unmount();

    const { rerender } = renderHook(
      ({ url }: { url: string }) => useAutoRefresh<string>(url, { intervalMs: 1000 }),
      { initialProps: { url: '/a' } }
    );
    await act(flush);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(800);
    });
    rerender({ url: '/b' });
    await act(flush);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(800);
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(200);
    });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('catches up when the tab becomes visible after the interval', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => respond({ n: 1 })) as never;
    renderHook(() => useAutoRefresh('/api', { intervalMs: 10_000 }));
    await act(flush);
    await act(async () => {
      jest.setSystemTime(Date.now() + 10_000);
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('keeps the last response until a newer one arrives', async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => respond('first'))
      .mockImplementationOnce(() => respond(null, false)) as never;
    const { result, rerender } = renderHook(
      ({ url }: { url: string | null }) => useAutoRefresh<string>(url, { intervalMs: 60_000 }),
      { initialProps: { url: '/a' as string | null } }
    );
    await act(flush);
    expect(result.current.data).toBe('first');
    rerender({ url: null });
    await act(flush);
    expect(result.current).toMatchObject({ data: 'first', status: 'ready', stale: false });
  });

  test('marks data stale after twice the interval without a newer response', async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => respond('first'))
      .mockImplementation(() => respond(null, false)) as never;
    const { result } = renderHook(() => useAutoRefresh<string>('/api', { intervalMs: 1000 }));
    await act(flush);
    expect(result.current).toMatchObject({ data: 'first', stale: false });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1999);
    });
    expect(result.current).toMatchObject({ data: 'first', stale: false });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(result.current).toMatchObject({ data: 'first', stale: true, status: 'ready' });
  });

  test('does not refresh while the tab is hidden', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => respond({ n: 1 })) as never;
    const state = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    renderHook(() => useAutoRefresh('/api', { intervalMs: 10_000 }));
    await act(flush);
    await act(async () => {
      jest.setSystemTime(Date.now() + 10_000);
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    state.mockRestore();
  });
});

describe('useStorage', () => {
  const codec: StorageCodec<number> = {
    load: (storage) => Number(storage.getItem('n') ?? 0),
    save: (storage, value) => storage.setItem('n', String(value)),
  };

  beforeEach(() => localStorage.clear());

  test('loads once and saves every update', () => {
    localStorage.setItem('n', '2');
    const { result } = renderHook(() => useStorage(codec));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
    expect(localStorage.getItem('n')).toBe('3');
  });
});
