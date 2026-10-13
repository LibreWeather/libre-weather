import { useCallback, useState } from 'react';
import type { StorageCodec } from '@/models/storage';

type SetStored<T> = (next: T | ((current: T) => T)) => void;

/**
 * State backed by storage: loaded once on mount, saved on every update.
 * @param {StorageCodec} codec how the value maps to storage keys
 * @param {Storage} [storage] defaults to `localStorage`
 * @returns {[T, SetStored<T>]}
 */
export const useStorage = <T>(codec: StorageCodec<T>, storage: Storage = localStorage) => {
  const [value, setValue] = useState(() => codec.load(storage));
  const setStored: SetStored<T> = useCallback(
    (next) => {
      setValue((current) => {
        const updated = typeof next === 'function' ? (next as (current: T) => T)(current) : next;
        codec.save(storage, updated);
        return updated;
      });
    },
    [codec, storage]
  );
  return [value, setStored] as const;
};
