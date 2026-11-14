import { convertCurrent, convertDaily, convertHourly, convertVolume, convertWind } from '@/utilities/convertUnits';
import {
  Condition,
  PressureUnit,
  TempUnit,
  UnitSystem,
  VisibilityUnit,
  VolumeUnit,
  WindUnit,
} from '@/models/weather';
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEY,
  loadPreferences,
  resolveCompact,
  resolveVolumeUnit,
  resolveWindUnit,
  sanitizePreferences,
  savePreferences,
} from '@/utilities/preferences';

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

  test('keeps a valid layout and drops an unknown one', () => {
    expect(sanitizePreferences({ layout: 'compact' }).layout).toBe('compact');
    expect(sanitizePreferences({ layout: 'dense' }).layout).toBe('auto');
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

describe('compact layout', () => {
  test('auto is compact on phones only', () => {
    expect(resolveCompact('auto', true)).toBe(true);
    expect(resolveCompact('auto', false)).toBe(false);
  });

  test('explicit choices ignore the screen size', () => {
    expect(resolveCompact('compact', false)).toBe(true);
    expect(resolveCompact('comfortable', true)).toBe(false);
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

  test('converts each forecast slice on its own', () => {
    const units = { wind: WindUnit.KMH, volume: VolumeUnit.MM };
    const current = convertCurrent(
      {
        apparentTemp: { value: 70, unit: TempUnit.F },
        condition: Condition.CLEAR,
        dewPoint: { value: 60, unit: TempUnit.F },
        humidity: 40,
        pressure: { value: 1010, unit: PressureUnit.MB },
        sunrise: 0,
        sunset: 0,
        temp: { value: 70, unit: TempUnit.F },
        time: 0,
        visibility: { value: 10, unit: VisibilityUnit.MI },
        windspeed: { magnitude: 10, direction: 90, unit: WindUnit.MPH },
      },
      units.wind
    );
    expect(current.windspeed).toEqual({ magnitude: 16.1, direction: 90, unit: WindUnit.KMH });

    const [hour] = convertHourly(
      [
        {
          apparentTemp: { value: 70, unit: TempUnit.F },
          cloudCover: 0,
          condition: Condition.CLEAR,
          description: 'Clear',
          dewPoint: { value: 60, unit: TempUnit.F },
          humidity: 40,
          precipProbability: 0,
          precipVolume: { value: 1, unit: VolumeUnit.IN },
          pressure: { value: 1010, unit: PressureUnit.MB },
          rainVolume: { value: 1, unit: VolumeUnit.IN },
          snowVolume: { value: 0, unit: VolumeUnit.IN },
          sunshineDuration: 0,
          temp: { value: 70, unit: TempUnit.F },
          time: 0,
          uvIndex: 0,
          visibility: { value: 10, unit: VisibilityUnit.MI },
          windspeed: { magnitude: 10, direction: 90, unit: WindUnit.MPH },
        },
      ],
      units
    );
    expect(hour.precipVolume.value).toBe(25.4);
    expect(hour.windspeed.unit).toBe(WindUnit.KMH);

    const [day] = convertDaily(
      [
        {
          condition: Condition.CLEAR,
          description: 'Clear',
          rainVolume: { value: 1, unit: VolumeUnit.IN },
          snowVolume: { value: 0, unit: VolumeUnit.IN },
          sunrise: 0,
          sunset: 0,
          temp: { min: { value: 50, unit: TempUnit.F }, max: { value: 70, unit: TempUnit.F } },
          time: 0,
          windspeed: { magnitude: 10, direction: 90, unit: WindUnit.MPH },
        },
      ],
      units
    );
    expect(day.rainVolume.value).toBe(25.4);
    expect(day.windspeed?.unit).toBe(WindUnit.KMH);
  });
});
