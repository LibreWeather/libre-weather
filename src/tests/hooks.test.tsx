import { act, renderHook, waitFor } from '@testing-library/react';
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
