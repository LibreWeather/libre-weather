export type AlertSeverity = 'EXTREME' | 'SEVERE' | 'MODERATE' | 'MINOR' | 'UNKNOWN';

export type AlertSource = 'NWS' | 'METNO';

export type WeatherAlert = {
  id: string;
  source: AlertSource;
  event: string;
  headline: string;
  description: string;
  instruction: string | null;
  severity: AlertSeverity;
  urgency: string | null;
  certainty: string | null;
  onset: number | null;
  expires: number | null;
  ends: number | null;
  sender: string;
  areas: string;
  url: string | null;
};

export type AlertsResponse = {
  coverage: boolean;
  sources: AlertSource[];
  alerts: WeatherAlert[];
};

export const SOURCE_NAMES: Record<AlertSource, string> = {
  NWS: 'National Weather Service',
  METNO: 'MET Norway',
};

/**
 * Alerts endpoint root. Defaults to a sibling of the weather endpoint, e.g.
 * https://api.libreweather.com/weather -> https://api.libreweather.com/alerts
 * @param {string} [weatherRoot] weather API root
 * @param {string} [override] explicit alerts API root
 * @returns {string | undefined} alerts API root without a trailing slash
 */
export const alertsRoot = (weatherRoot?: string, override?: string) => {
  if (override) return override.replace(/\/$/, '');
  if (!weatherRoot) return undefined;
  return new URL('../alerts', `${weatherRoot.replace(/\/$/, '')}/`).href.replace(/\/$/, '');
};
