import { useSyncExternalStore } from 'react';

export type AppLocation = { pathname: string; search: string; state: unknown };

/** Fired after in-app navigation; `pushState` itself doesn't notify anyone. */
const NAVIGATE_EVENT = 'app:navigate';

let cached: AppLocation | null = null;

const read = (): AppLocation => {
  const { pathname, search } = window.location;
  const { state } = window.history;
  if (!cached || cached.pathname !== pathname || cached.search !== search || cached.state !== state) {
    cached = { pathname, search, state };
  }
  return cached;
};

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
};

/**
 * Move to another URL in the app without reloading.
 * @param {string} to path, optionally with a query string
 * @param {{ replace?: boolean, state?: unknown }} [options] replace the current entry instead of adding one
 */
type NavigateOptions = { replace?: boolean; state?: unknown };

export const navigate = (to: string, { replace = false, state = null }: NavigateOptions = {}) => {
  if (replace) window.history.replaceState(state, '', to);
  else window.history.pushState(state, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

/** The current URL and history state, re-rendering on navigation and Back/Forward. */
export const useLocation = () => useSyncExternalStore(subscribe, read, read);
