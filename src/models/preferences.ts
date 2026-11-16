import type { BackendPref } from '@/utilities/backend';

export type { BackendPref };

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
  /** Anonymous page-view sharing. Off until the user opts in. */
  analytics: boolean;
  /** The first-run analytics sheet has been answered, so it does not come back. */
  analyticsAsked: boolean;
  /**
   * Backend override sent as `x-backend`. Empty uses the API's configured backend.
   */
  backend: BackendPref;
  /** Key sent as `x-backend-key` for OpenWeatherMap and Pirate Weather. */
  backendKey: string;
};

/** Preferences picked from a fixed set of options, as opposed to free text or on/off switches. */
export type PreferenceChoiceKey = {
  [K in keyof Preferences]: Preferences[K] extends string ? (string extends Preferences[K] ? never : K) : never;
}[keyof Preferences];
