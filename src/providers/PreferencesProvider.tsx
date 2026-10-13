import React from 'react';

import { setClockPreference, uses12HourClock } from '../utilities/locale';
import {
  COMPACT_QUERY,
  REDUCED_MOTION_QUERY,
  REDUCED_TRANSPARENCY_QUERY,
  loadPreferences,
  resolveCompact,
  resolveReduceMotion,
  resolveReduceTransparency,
  resolveUnitSystem,
  resolveVolumeUnit,
  resolveWindUnit,
  savePreferences,
  type Preferences,
} from '../utilities/preferences';
import type { UnitSystem, VolumeUnit, WindUnit } from '../utilities/weatherTypes';

export type ResolvedPreferences = {
  unitSystem: UnitSystem;
  windUnit: WindUnit;
  volumeUnit: VolumeUnit;
  twelveHour: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  compact: boolean;
};

export type PreferencesContextValue = {
  preferences: Preferences;
  /** What `auto` settings currently work out to. */
  resolved: ResolvedPreferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
};

const PreferencesContext = React.createContext<PreferencesContextValue | null>(null);

/** Re-render when an OS-level media preference flips, so `auto` settings follow it live. */
const useMediaVersion = (queries: string[]) => {
  const [version, setVersion] = React.useState(0);
  React.useEffect(() => {
    if (!window.matchMedia) return undefined;
    const lists = queries.map((query) => window.matchMedia(query));
    const bump = () => setVersion((n) => n + 1);
    lists.forEach((list) => list.addEventListener?.('change', bump));
    return () => lists.forEach((list) => list.removeEventListener?.('change', bump));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return version;
};

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = React.useState(() => loadPreferences(localStorage));
  const mediaVersion = useMediaVersion([REDUCED_MOTION_QUERY, REDUCED_TRANSPARENCY_QUERY, COMPACT_QUERY]);

  // Formatters are plain functions, so the clock setting is applied before children render.
  setClockPreference(preferences.clock);

  const resolved = React.useMemo<ResolvedPreferences>(() => {
    const unitSystem = resolveUnitSystem(preferences.temperature);
    return {
      unitSystem,
      windUnit: resolveWindUnit(preferences.wind, unitSystem),
      volumeUnit: resolveVolumeUnit(preferences.precip, unitSystem),
      twelveHour: uses12HourClock(),
      reduceMotion: resolveReduceMotion(preferences.motion),
      reduceTransparency: resolveReduceTransparency(preferences.transparency),
      compact: resolveCompact(preferences.layout),
    };
    // mediaVersion re-resolves `auto` after an OS change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences, mediaVersion]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', resolved.reduceMotion);
    root.classList.toggle('reduce-transparency', resolved.reduceTransparency);
    root.classList.toggle('compact', resolved.compact);
  }, [resolved.reduceMotion, resolved.reduceTransparency, resolved.compact]);

  const setPreference = React.useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      savePreferences(localStorage, next);
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ preferences, resolved, setPreference }), [preferences, resolved, setPreference]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = React.useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside a PreferencesProvider');
  return context;
};
