import type { AlertSeverity, AlertSource, WeatherAlert } from '@/models/alerts';
import { formatDateTime } from './locale';

export const SOURCE_NAMES: Record<AlertSource, string> = {
  NWS: 'National Weather Service',
  METNO: 'MET Norway',
};

const SEVERITY_CLASSES: Record<AlertSeverity, string> = {
  EXTREME: 'severity-extreme',
  SEVERE: 'severity-severe',
  MODERATE: 'severity-moderate',
  MINOR: 'severity-minor',
  UNKNOWN: 'severity-unknown',
};

/** Tailwind utility setting `--alert-color` for a severity. */
export const severityClass = (severity: AlertSeverity | undefined) =>
  (severity && SEVERITY_CLASSES[severity]) || SEVERITY_CLASSES.UNKNOWN;

/** Full name of the agency behind an alert, or its code when unknown. */
export const sourceName = (source: AlertSource) => SOURCE_NAMES[source] ?? source;

/** When the hazard ends, falling back to when the message expires. */
export const alertEnd = (alert: WeatherAlert) => alert.ends ?? alert.expires;

/** Drops alerts whose message has expired. */
export const activeAlerts = (alerts: WeatherAlert[], now = Date.now()) =>
  alerts.filter((alert) => !alert.expires || alert.expires > now);

export const alertTime = (ms: number) => formatDateTime(ms, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

export const alertDateTime = (ms: number) =>
  formatDateTime(ms, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const untilLabel = (alert: WeatherAlert) => {
  const end = alertEnd(alert);
  return end ? `until ${alertTime(end)}` : null;
};

/** Onset time when the alert hasn't started yet. */
export const startsLater = (alert: WeatherAlert, now = Date.now()) =>
  alert.onset && alert.onset > now ? alert.onset : null;

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

/** Label/value pairs for the alert dialog, skipping anything the alert doesn't have. */
export const alertFacts = (alert: WeatherAlert): [string, string][] => {
  const end = alertEnd(alert);
  const facts: [string, string | null][] = [
    ['Starts', alert.onset ? alertDateTime(alert.onset) : null],
    ['Ends', end ? alertDateTime(end) : null],
    ['Message expires', alert.ends && alert.expires && alert.expires !== alert.ends ? alertDateTime(alert.expires) : null],
    ['Severity', titleCase(alert.severity)],
    ['Urgency', alert.urgency],
    ['Certainty', alert.certainty],
    ['Issued by', alert.sender],
    ['Source', sourceName(alert.source)],
  ];
  return facts.filter((fact): fact is [string, string] => Boolean(fact[1]));
};
