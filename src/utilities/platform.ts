import { STANDALONE_QUERY, mediaMatches } from './media';

/** Running as an installed app rather than in a browser tab. */
export const isStandalone = () =>
  mediaMatches(STANDALONE_QUERY) || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** iOS browsers never fire `beforeinstallprompt`; installing goes through Safari's share sheet. */
export const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const appleTouchIconHref = () =>
  document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href ?? null;
