import type {
  LayoutPref,
  MotionPref,
  PrecipPref,
  Preferences,
  TemperaturePref,
  TransparencyPref,
  WindPref,
} from '@/models/preferences';
import type { StorageCodec } from '@/models/storage';
import { UnitSystem, VolumeUnit, WindUnit } from '@/models/weather';
import { browserUnits } from './localeUnits';

export const DEFAULT_PREFERENCES: Preferences = {
  temperature: 'auto',
  wind: 'auto',
  precip: 'auto',
  clock: 'auto',
  alerts: true,
  motion: 'auto',
  transparency: 'auto',
  layout: 'auto',
  installBannerDismissed: false,
};

export const STORAGE_KEY = 'preferences';
const LEGACY_UNITS_KEY = 'units';
const LEGACY_INSTALL_KEY = 'installBannerDismissed';

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/**
 * Validate a stored preferences object, keeping known values and defaulting the rest.
 * @param {unknown} raw parsed JSON from storage
 * @returns {Preferences}
 */
export const sanitizePreferences = (raw: unknown): Preferences => {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_PREFERENCES;
  return {
    temperature: pick(value.temperature, ['auto', 'F', 'C'], d.temperature),
    wind: pick(value.wind, ['auto', 'mph', 'kmh', 'ms'], d.wind),
    precip: pick(value.precip, ['auto', 'in', 'mm'], d.precip),
    clock: pick(value.clock, ['auto', '12', '24'], d.clock),
    alerts: typeof value.alerts === 'boolean' ? value.alerts : d.alerts,
    motion: pick(value.motion, ['auto', 'reduce', 'full'], d.motion),
    transparency: pick(value.transparency, ['auto', 'reduce', 'full'], d.transparency),
    layout: pick(value.layout, ['auto', 'compact', 'comfortable'], d.layout),
    installBannerDismissed:
      typeof value.installBannerDismissed === 'boolean' ? value.installBannerDismissed : d.installBannerDismissed,
  };
};

/**
 * Read preferences from storage, folding in the separate keys used before preferences existed.
 * @param {Storage} storage
 * @returns {Preferences}
 */
export const loadPreferences = (storage: Storage): Preferences => {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (saved) return sanitizePreferences(JSON.parse(saved));
  } catch {
    // Corrupt JSON falls through to legacy keys and defaults.
  }
  const legacyUnits = storage.getItem(LEGACY_UNITS_KEY);
  return sanitizePreferences({
    temperature: legacyUnits === UnitSystem.METRIC ? 'C' : legacyUnits === UnitSystem.IMPERIAL ? 'F' : 'auto',
    installBannerDismissed: storage.getItem(LEGACY_INSTALL_KEY) === 'true',
  });
};

export const savePreferences = (storage: Storage, preferences: Preferences) => {
  storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  storage.removeItem(LEGACY_UNITS_KEY);
  storage.removeItem(LEGACY_INSTALL_KEY);
};

export const preferencesStore: StorageCodec<Preferences> = { load: loadPreferences, save: savePreferences };

/** Unit system the weather API is asked for; temperature decides it. */
export const resolveUnitSystem = (temperature: TemperaturePref): UnitSystem => {
  if (temperature === 'F') return UnitSystem.IMPERIAL;
  if (temperature === 'C') return UnitSystem.METRIC;
  return browserUnits();
};

/** `auto` keeps whatever the API sends for the unit system: mph for imperial, m/s for metric. */
export const resolveWindUnit = (wind: WindPref, system: UnitSystem): WindUnit => {
  if (wind === 'mph') return WindUnit.MPH;
  if (wind === 'kmh') return WindUnit.KMH;
  if (wind === 'ms') return WindUnit.MS;
  return system === UnitSystem.IMPERIAL ? WindUnit.MPH : WindUnit.MS;
};

export const resolveVolumeUnit = (precip: PrecipPref, system: UnitSystem): VolumeUnit => {
  if (precip === 'in') return VolumeUnit.IN;
  if (precip === 'mm') return VolumeUnit.MM;
  return system === UnitSystem.IMPERIAL ? VolumeUnit.IN : VolumeUnit.MM;
};

/** `auto` follows the OS reduced-motion setting. */
export const resolveReduceMotion = (motion: MotionPref, osReduces: boolean) =>
  motion === 'reduce' || (motion === 'auto' && osReduces);

/** `auto` follows the OS setting where the browser exposes it (Chromium and Firefox). */
export const resolveReduceTransparency = (transparency: TransparencyPref, osReduces: boolean) =>
  transparency === 'reduce' || (transparency === 'auto' && osReduces);

/** `auto` is compact on phone-width screens. */
export const resolveCompact = (layout: LayoutPref, phone: boolean) =>
  layout === 'compact' || (layout === 'auto' && phone);
