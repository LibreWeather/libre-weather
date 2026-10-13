import { browserLocales } from './locale';
import { UnitSystem } from './weatherTypes';

/** Regions that report temperature in Fahrenheit: the US and its territories, plus a few others. */
const FAHRENHEIT_REGIONS = new Set(['US', 'PR', 'GU', 'VI', 'AS', 'MP', 'UM', 'LR', 'MM', 'BS', 'KY', 'PW', 'FM', 'MH']);

const regionOf = (tag: string, maximize: boolean) => {
  try {
    const locale = new Intl.Locale(tag);
    return (maximize ? locale.maximize() : locale).region;
  } catch {
    return undefined;
  }
};

/**
 * Unit system for the browser's preferred locales. Uses the first locale with an explicit region
 * (`en-GB`, `es-US`), otherwise the likely region of the first one (`en` -> US, `de` -> DE).
 * @param {readonly string[]} languages BCP 47 tags, most preferred first
 * @returns {UnitSystem} IMPERIAL for Fahrenheit regions, otherwise METRIC
 */
export const unitsForLocales = (languages: readonly string[]): UnitSystem => {
  const region =
    languages.map((tag) => regionOf(tag, false)).find(Boolean) ?? (languages[0] && regionOf(languages[0], true));
  if (!region) return UnitSystem.METRIC;
  return FAHRENHEIT_REGIONS.has(region) ? UnitSystem.IMPERIAL : UnitSystem.METRIC;
};

export const browserUnits = () => unitsForLocales(browserLocales());
