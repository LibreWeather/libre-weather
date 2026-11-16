export type RuntimeConfig = {
  matomoUrl?: string;
  matomoSiteId?: string;
};

export const CONFIG_ASSIGNMENT = 'window.__CONFIG__ = ';

/**
 * Matomo base URL, or nothing when the value is not an http(s) URL.
 * @param {string} url value from `MATOMO_URL`
 * @returns {string | undefined}
 */
export const matomoBase = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
    return parsed.href.endsWith('/') ? parsed.href : `${parsed.href}/`;
  } catch {
    return;
  }
};

/**
 * Tracker target when both the server and the site id are present.
 * @param {RuntimeConfig | null | undefined} config runtime config, once loaded
 * @returns {{ base: string, siteId: string } | undefined}
 */
export const matomoTarget = (config: RuntimeConfig | null | undefined) => {
  const siteId = config?.matomoSiteId?.trim();
  const base = config?.matomoUrl ? matomoBase(config.matomoUrl) : undefined;
  if (!base || !siteId) return;
  return { base, siteId };
};

/**
 * Read the assignment written to `/config.js`. Anything else, including the SPA shell, is no config.
 * @param {string} body response body
 * @returns {RuntimeConfig | null}
 */
export const parseConfig = (body: string): RuntimeConfig | null => {
  const trimmed = body.trim();
  if (!trimmed.startsWith(CONFIG_ASSIGNMENT)) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(CONFIG_ASSIGNMENT.length).replace(/;\s*$/, '')) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    const config: RuntimeConfig = {};
    if (typeof record.matomoUrl === 'string') config.matomoUrl = record.matomoUrl;
    if (typeof record.matomoSiteId === 'string') config.matomoSiteId = record.matomoSiteId;
    return config;
  } catch {
    return null;
  }
};

/** Load `/config.js`. Missing, HTML (the SPA shell), or non-config bodies become `null`. */
export const loadRuntimeConfig = async (): Promise<RuntimeConfig | null> => {
  try {
    const response = await fetch('/config.js', { cache: 'no-store' });
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok || !/javascript/i.test(type)) return null;
    return parseConfig(await response.text());
  } catch {
    return null;
  }
};
