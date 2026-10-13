import { useEffect, useSyncExternalStore, type RefObject } from 'react';

/** Clearance under the sticky navbar before the hero counts as scrolled away. */
const NAVBAR_CLEARANCE_PX = 72;
/** Also set on `<html>` so styles outside React can react to it. */
const OFFSCREEN_CLASS = 'hero-offscreen';

let offscreen = false;
const listeners = new Set<() => void>();

const setOffscreen = (next: boolean) => {
  if (next === offscreen) return;
  offscreen = next;
  document.documentElement.classList.toggle(OFFSCREEN_CLASS, next);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Tracks whether `hero` has scrolled up behind the navbar. */
export const useTrackHero = (hero: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const node = hero.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: `-${NAVBAR_CLEARANCE_PX}px 0px 0px 0px` }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setOffscreen(false);
    };
  }, [hero]);
};

/** True while the tracked hero is scrolled offscreen. */
export const useHeroOffscreen = () => useSyncExternalStore(subscribe, () => offscreen, () => false);
