/** The browser's preferred locales, most preferred first. Drives locale-based unit defaults. */
export const browserLocales = (): readonly string[] => {
  if (typeof navigator === 'undefined') return [];
  if (navigator.languages?.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
};

let clockPreference: 'auto' | '12' | '24' = 'auto';

/** Set by PreferencesProvider; `auto` defers to the browser's default time format. */
export const setClockPreference = (value: 'auto' | '12' | '24') => {
  clockPreference = value;
};

const safeLocales = (locales?: readonly string[]) => {
  if (!locales) return undefined;
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locales as string[]);
  } catch {
    return [];
  }
};

/**
 * Whether times use a 12-hour clock (3 PM) rather than 24-hour (15:00). Without explicit locales,
 * a saved clock preference wins; otherwise the browser's default format decides, which follows the
 * OS 12/24-hour setting in browsers that pass it through (Safari, Firefox with OS regional prefs).
 * @param {readonly string[]} [locales] BCP 47 tags to check instead of the browser default
 * @returns {boolean}
 */
export const uses12HourClock = (locales?: readonly string[]) => {
  if (!locales) return clockPreference === 'auto' ? browserUses12HourClock() : clockPreference === '12';
  const { hourCycle, hour12 } = new Intl.DateTimeFormat(safeLocales(locales), { hour: 'numeric' }).resolvedOptions();
  return hourCycle ? hourCycle === 'h11' || hourCycle === 'h12' : Boolean(hour12);
};

/** The browser's own 12/24-hour default, ignoring any saved preference. */
export const browserUses12HourClock = () => {
  const { hourCycle, hour12 } = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
  return hourCycle ? hourCycle === 'h11' || hourCycle === 'h12' : Boolean(hour12);
};

/** `3 PM` -> `3pm`; leaves 24-hour output alone. */
const compact = (text: string) => text.toLowerCase().replace(/[\s\u202f.]/g, '');

/**
 * Short hour label for charts: `3pm` on 12-hour clocks, `15:00` on 24-hour clocks.
 * @param {Date|string|number} timestamp date-resolvable
 * @param {readonly string[]} [locales] BCP 47 tags; defaults to the browser's
 * @returns {string}
 */
export const formatHour = (timestamp: Date | string | number, locales?: readonly string[]) => {
  const date = new Date(timestamp);
  if (uses12HourClock(locales)) {
    return compact(date.toLocaleTimeString(safeLocales(locales), { hour: 'numeric', hourCycle: 'h12' }));
  }
  return date.toLocaleTimeString(safeLocales(locales), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

/**
 * Clock time with minutes: `7:26am` on 12-hour clocks, `07:26` on 24-hour clocks.
 * @param {Date|string|number} timestamp date-resolvable
 * @param {readonly string[]} [locales] BCP 47 tags; defaults to the browser's
 * @returns {string}
 */
export const formatClock = (timestamp: Date | string | number, locales?: readonly string[]) => {
  const date = new Date(timestamp);
  if (uses12HourClock(locales)) {
    return compact(
      date.toLocaleTimeString(safeLocales(locales), { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' })
    );
  }
  return date.toLocaleTimeString(safeLocales(locales), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

/**
 * Locale-aware date/time honoring the clock preference, for longer labels like alert times.
 * @param {number} ms epoch milliseconds
 * @param {Intl.DateTimeFormatOptions} options date parts to include
 * @returns {string}
 */
export const formatDateTime = (ms: number, options: Intl.DateTimeFormatOptions) =>
  new Date(ms).toLocaleString(undefined, { ...options, hourCycle: uses12HourClock() ? 'h12' : 'h23' });
