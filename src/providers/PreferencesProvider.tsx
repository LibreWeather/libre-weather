import React from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useStorage } from '@/hooks/useStorage';
import type { Preferences } from '@/models/preferences';
import type { UnitSystem, VolumeUnit, WindUnit } from '@/models/weather';
import { setClockPreference, uses12HourClock } from '@/utilities/locale';
import { PHONE_QUERY, REDUCED_MOTION_QUERY, REDUCED_TRANSPARENCY_QUERY } from '@/utilities/media';
import {
  preferencesStore,
  resolveCompact,
  resolveReduceMotion,
  resolveReduceTransparency,
  resolveUnitSystem,
  resolveVolumeUnit,
  resolveWindUnit,
} from '@/utilities/preferences';

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

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useStorage(preferencesStore);
  const osReducesMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const osReducesTransparency = useMediaQuery(REDUCED_TRANSPARENCY_QUERY);
  const phone = useMediaQuery(PHONE_QUERY);

  // Formatters are plain functions, so the clock setting is applied before children render.
  setClockPreference(preferences.clock);

  const resolved = React.useMemo<ResolvedPreferences>(() => {
    const unitSystem = resolveUnitSystem(preferences.temperature);
    return {
      unitSystem,
      windUnit: resolveWindUnit(preferences.wind, unitSystem),
      volumeUnit: resolveVolumeUnit(preferences.precip, unitSystem),
      twelveHour: uses12HourClock(),
      reduceMotion: resolveReduceMotion(preferences.motion, osReducesMotion),
      reduceTransparency: resolveReduceTransparency(preferences.transparency, osReducesTransparency),
      compact: resolveCompact(preferences.layout, phone),
    };
  }, [preferences, osReducesMotion, osReducesTransparency, phone]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', resolved.reduceMotion);
    root.classList.toggle('reduce-transparency', resolved.reduceTransparency);
    root.classList.toggle('compact', resolved.compact);
  }, [resolved.reduceMotion, resolved.reduceTransparency, resolved.compact]);

  const setPreference = React.useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
      setPreferences((current) => ({ ...current, [key]: value })),
    [setPreferences]
  );

  const value = React.useMemo(() => ({ preferences, resolved, setPreference }), [preferences, resolved, setPreference]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = React.useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside a PreferencesProvider');
  return context;
};
