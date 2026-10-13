/** Reads and writes one value to a `Storage`, owning its keys and validation. */
export type StorageCodec<T> = {
  load: (storage: Storage) => T;
  save: (storage: Storage, value: T) => void;
};
