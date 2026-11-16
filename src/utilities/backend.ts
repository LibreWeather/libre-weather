export enum Backend {
  OWM = 'OWM',
  METEO = 'METEO',
  PIRATE = 'PIRATE'
}

/** LibreWeather API address for this build. */
export const WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

/** Empty keeps the API's configured backend. */
export const BACKEND_PREFS = ['', Backend.METEO, Backend.OWM, Backend.PIRATE] as const;

export type BackendPref = (typeof BACKEND_PREFS)[number];

const NAMES: Record<Backend, string> = {
  [Backend.METEO]: 'Open-Meteo',
  [Backend.OWM]: 'OpenWeatherMap',
  [Backend.PIRATE]: 'Pirate Weather',
};

const IDS = new Set<string>(Object.values(Backend));

export const isBackend = (value: string): value is Backend => IDS.has(value);

export const parseBackend = (value: string | null | undefined): Backend | null =>
  value && isBackend(value) ? value : null;

export const backendNeedsKey = (backend: BackendPref) =>
  backend === Backend.OWM || backend === Backend.PIRATE;

export const backendLabel = (id: string) => (isBackend(id) ? NAMES[id] : id);

/** Served backend when it is not the one this page asked for. Default asks for nothing. */
export const mismatchedBackend = (sent: BackendPref, served: Array<Backend | null | undefined>) => {
  if (!sent) return null;
  return served.find((value) => value && value !== sent) ?? null;
};

export const forecastIsDown = (slices: Array<{ status: string; hasData: boolean }>) =>
  slices.length > 0 && slices.every((slice) => slice.status === 'error' && !slice.hasData);
