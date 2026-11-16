import { matomoTarget, type RuntimeConfig } from './config';

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

const SCRIPT_ATTR = 'data-matomo';

/**
 * Load Matomo when usage sharing is on, and stop it when sharing is turned off.
 * The script stays unloaded until the first opt-in.
 * @param {RuntimeConfig | null} config runtime config
 * @param {boolean} enabled preferences.analytics
 */
export const syncMatomo = (config: RuntimeConfig | null, enabled: boolean) => {
  const target = matomoTarget(config);
  if (!target) return;

  const paq = (window._paq = window._paq ?? []);
  const existing = document.querySelector(`script[${SCRIPT_ATTR}]`);
  if (!enabled) {
    if (existing) paq.push(['optUserOut']);
    return;
  }

  if (existing) {
    paq.push(['forgetUserOptOut']);
    return;
  }

  paq.push(['trackPageView']);
  paq.push(['enableLinkTracking']);
  paq.push(['setTrackerUrl', `${target.base}matomo.php`]);
  paq.push(['setSiteId', target.siteId]);
  const script = document.createElement('script');
  script.async = true;
  script.src = `${target.base}matomo.js`;
  script.setAttribute(SCRIPT_ATTR, '');
  document.head.appendChild(script);
};
