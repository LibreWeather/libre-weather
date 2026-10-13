import { convertVolume, convertWind } from '../utilities/convertUnits';
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEY,
  loadPreferences,
  resolveVolumeUnit,
  resolveWindUnit,
  sanitizePreferences,
  savePreferences,
} from '../utilities/preferences';
import { UnitSystem, VolumeUnit, WindUnit } from '../utilities/weatherTypes';

describe('preferences storage', () => {
  beforeEach(() => localStorage.clear());

  test('defaults everything to auto', () => {
    expect(loadPreferences(localStorage)).toEqual(DEFAULT_PREFERENCES);
  });

  test('carries over the keys used before preferences existed', () => {
    localStorage.setItem('units', 'METRIC');
    localStorage.setItem('installBannerDismissed', 'true');
    const prefs = loadPreferences(localStorage);
    expect(prefs.temperature).toBe('C');
    expect(prefs.installBannerDismissed).toBe(true);

    savePreferences(localStorage, prefs);
    expect(localStorage.getItem('units')).toBeNull();
    expect(localStorage.getItem('installBannerDismissed')).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).temperature).toBe('C');
  });

  test('drops unknown or invalid values', () => {
    expect(sanitizePreferences({ wind: 'knots', clock: '24', alerts: 'yes', extra: 1 })).toEqual({
      ...DEFAULT_PREFERENCES,
      clock: '24',
    });
  });

  test('survives corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{nope');
    expect(loadPreferences(localStorage)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe('unit resolution', () => {
  test('auto follows the API unit system', () => {
    expect(resolveWindUnit('auto', UnitSystem.IMPERIAL)).toBe(WindUnit.MPH);
    expect(resolveWindUnit('auto', UnitSystem.METRIC)).toBe(WindUnit.MS);
    expect(resolveVolumeUnit('auto', UnitSystem.METRIC)).toBe(VolumeUnit.MM);
  });

  test('explicit choices win', () => {
    expect(resolveWindUnit('kmh', UnitSystem.IMPERIAL)).toBe(WindUnit.KMH);
    expect(resolveVolumeUnit('in', UnitSystem.METRIC)).toBe(VolumeUnit.IN);
  });
});

describe('conversion', () => {
  test('converts wind between units', () => {
    expect(convertWind({ magnitude: 10, direction: 90, unit: WindUnit.MPH }, WindUnit.KMH)).toEqual({
      magnitude: 16.1,
      direction: 90,
      unit: WindUnit.KMH,
    });
    expect(convertWind({ magnitude: 10, direction: 0, unit: WindUnit.MS }, WindUnit.MPH).magnitude).toBe(22.4);
    expect(convertWind(undefined, WindUnit.MPH)).toBeUndefined();
  });

  test('converts precipitation and keeps empty values empty', () => {
    expect(convertVolume({ value: 1, unit: VolumeUnit.IN }, VolumeUnit.MM)).toEqual({
      value: 25.4,
      unit: VolumeUnit.MM,
    });
    expect(convertVolume({ value: 10, unit: VolumeUnit.MM }, VolumeUnit.IN).value).toBe(0.39);
    expect(convertVolume({ value: null, unit: VolumeUnit.MM }, VolumeUnit.IN)).toEqual({
      value: null,
      unit: VolumeUnit.IN,
    });
  });
});
