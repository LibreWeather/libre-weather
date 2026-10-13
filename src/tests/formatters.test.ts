import {
  MISSING,
  numberDisplay,
  tempDisplay,
  visibilityDisplay,
  volumeDisplay,
  windDisplay,
} from '@/utilities/formatters';
import { TempUnit, VisibilityUnit, VolumeUnit, WindUnit } from '@/models/weather';

describe('formatters', () => {
  test('temperatures round and mark Kelvin', () => {
    expect(tempDisplay({ value: '71.6', unit: TempUnit.F })).toBe('72˚');
    expect(tempDisplay({ value: 290, unit: TempUnit.K })).toBe('290K');
    expect(tempDisplay(undefined)).toBe(MISSING);
  });

  test('numbers round to the given places', () => {
    expect(numberDisplay(3.14159, 2)).toBe('3.14');
    expect(numberDisplay(null)).toBe(MISSING);
    expect(numberDisplay(Number.NaN)).toBe(MISSING);
  });

  test('missing precipitation reads as zero', () => {
    expect(volumeDisplay({ value: 0.2, unit: VolumeUnit.IN })).toBe('0.2 in');
    expect(volumeDisplay({ value: null, unit: VolumeUnit.MM })).toBe('0 mm');
  });

  test('wind shows its unit, or a dash when missing', () => {
    expect(windDisplay({ magnitude: '12.6', direction: 0, unit: WindUnit.KMH })).toBe('13 km/h');
    expect(windDisplay({ magnitude: '', direction: 0, unit: WindUnit.MS })).toBe(MISSING);
    expect(windDisplay(null)).toBe(MISSING);
  });

  test('metric visibility is shown in kilometres', () => {
    expect(visibilityDisplay({ value: 4200, unit: VisibilityUnit.M })).toBe('4 km');
    expect(visibilityDisplay({ value: 24000, unit: VisibilityUnit.M })).toBe('10+ km');
    expect(visibilityDisplay({ value: 12, unit: VisibilityUnit.MI })).toBe('10+ mi');
    expect(visibilityDisplay({ value: 80, unit: VisibilityUnit.Percent })).toBe('80 %');
  });
});
