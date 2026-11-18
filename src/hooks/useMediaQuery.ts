import React from 'react';
import { mediaMatches } from '@/utilities/media';

/**
 * Whether a media query currently matches, re-rendering when it changes.
 * @param {string} query CSS media query
 * @returns {boolean}
 */
export const useMediaQuery = (query: string) => {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia?.(query);
      list?.addEventListener?.('change', onChange);
      return () => list?.removeEventListener?.('change', onChange);
    },
    [query]
  );
  return React.useSyncExternalStore(subscribe, () => mediaMatches(query), () => false);
};
