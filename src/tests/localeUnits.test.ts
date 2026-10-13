import { unitsForLocales } from '@/utilities/localeUnits';
import { UnitSystem } from '@/models/weather';

describe('unitsForLocales', () => {
  test.each([
    [['en-US'], UnitSystem.IMPERIAL],
    [['es-US', 'es'], UnitSystem.IMPERIAL],
    [['en-PR'], UnitSystem.IMPERIAL],
    [['en-LR'], UnitSystem.IMPERIAL],
    [['en-GB'], UnitSystem.METRIC],
    [['en-CA', 'fr-CA'], UnitSystem.METRIC],
    [['de-DE'], UnitSystem.METRIC],
    [['ja'], UnitSystem.METRIC],
    [['en'], UnitSystem.IMPERIAL],
  ])('%j -> %s', (languages, expected) => {
    expect(unitsForLocales(languages)).toBe(expected);
  });

  test('prefers the first explicit region over likely subtags', () => {
    expect(unitsForLocales(['en', 'en-GB'])).toBe(UnitSystem.METRIC);
  });

  test('falls back to metric for missing or invalid locales', () => {
    expect(unitsForLocales([])).toBe(UnitSystem.METRIC);
    expect(unitsForLocales(['not a locale!'])).toBe(UnitSystem.METRIC);
  });
});
