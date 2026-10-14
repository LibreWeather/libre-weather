/** Matches Tailwind's `max-md` variant. */
export const PHONE_QUERY = '(max-width: 767px)';
/** Matches Tailwind's `max-lg` variant (`--breakpoint-lg` in styles.css). */
export const TABLET_QUERY = '(max-width: 991px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const REDUCED_TRANSPARENCY_QUERY = '(prefers-reduced-transparency: reduce)';
export const STANDALONE_QUERY = '(display-mode: standalone)';

export const mediaMatches = (query: string) =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches);
