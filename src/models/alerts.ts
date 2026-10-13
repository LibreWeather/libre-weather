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
