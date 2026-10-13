import { useCallback, useSyncExternalStore } from 'react';
import { mediaMatches } from '@/utilities/media';

/**
 * Whether a media query currently matches, re-rendering when it changes.
 * @param {string} query CSS media query
 * @returns {boolean}
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia?.(query);
      list?.addEventListener?.('change', onChange);
      return () => list?.removeEventListener?.('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => mediaMatches(query), () => false);
};
