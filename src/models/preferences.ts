import type { DataSourcePref } from '@/models/dataSource';

export type { DataSourcePref };

export type TemperaturePref = 'auto' | 'F' | 'C';
export type WindPref = 'auto' | 'mph' | 'kmh' | 'ms';
export type PrecipPref = 'auto' | 'in' | 'mm';
export type ClockPref = 'auto' | '12' | '24';
export type MotionPref = 'auto' | 'reduce' | 'full';
export type TransparencyPref = 'auto' | 'reduce' | 'full';
export type LayoutPref = 'auto' | 'compact' | 'comfortable';

export type Preferences = {
  temperature: TemperaturePref;
  wind: WindPref;
  precip: PrecipPref;
  clock: ClockPref;
  alerts: boolean;
  motion: MotionPref;
  transparency: TransparencyPref;
  layout: LayoutPref;
  installBannerDismissed: boolean;
  /** Forecast source. `auto` keeps today's LibreWeather API when one is configured. */
  dataSource: DataSourcePref;
  /** Pirate Weather key typed into preferences. Empty until the user pastes one. */
  pirateWeatherKey: string;
};

/** Preferences picked from a fixed set of options, as opposed to free text or on/off switches. */
export type PreferenceChoiceKey = {
  [K in keyof Preferences]: Preferences[K] extends string ? (string extends Preferences[K] ? never : K) : never;
}[keyof Preferences];
