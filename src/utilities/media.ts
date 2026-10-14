import { BREAKPOINTS } from '../theme/tokens';

const below = (rem: number) => `(max-width: ${rem * 16 - 1}px)`;

/** Matches Tailwind's `max-md` variant. */
export const PHONE_QUERY = below(BREAKPOINTS.md);
/** Matches Tailwind's `max-lg` variant. */
export const TABLET_QUERY = below(BREAKPOINTS.lg);
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const REDUCED_TRANSPARENCY_QUERY = '(prefers-reduced-transparency: reduce)';
export const STANDALONE_QUERY = '(display-mode: standalone)';

export const mediaMatches = (query: string) =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches);
