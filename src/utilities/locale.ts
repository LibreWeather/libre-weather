/** The browser's preferred locales, most preferred first. Drives units and time formatting. */
export const browserLocales = (): readonly string[] => {
  if (typeof navigator === 'undefined') return [];
  if (navigator.languages?.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
};

const safeLocales = (locales: readonly string[]) => {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locales as string[]);
  } catch {
    return [];
  }
};

/**
 * Whether the locale writes times on a 12-hour clock (3 PM) rather than 24-hour (15:00).
 * @param {readonly string[]} [locales] BCP 47 tags; defaults to the browser's
 * @returns {boolean}
 */
export const uses12HourClock = (locales: readonly string[] = browserLocales()) => {
  const { hourCycle, hour12 } = new Intl.DateTimeFormat(safeLocales(locales), { hour: 'numeric' }).resolvedOptions();
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
export const formatHour = (timestamp: Date | string | number, locales: readonly string[] = browserLocales()) => {
  const date = new Date(timestamp);
  const supported = safeLocales(locales);
  if (uses12HourClock(locales)) {
    return compact(date.toLocaleTimeString(supported, { hour: 'numeric' }));
  }
  return date.toLocaleTimeString(supported, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

/**
 * Clock time with minutes: `7:26am` on 12-hour clocks, `07:26` on 24-hour clocks.
 * @param {Date|string|number} timestamp date-resolvable
 * @param {readonly string[]} [locales] BCP 47 tags; defaults to the browser's
 * @returns {string}
 */
export const formatClock = (timestamp: Date | string | number, locales: readonly string[] = browserLocales()) => {
  const date = new Date(timestamp);
  const supported = safeLocales(locales);
  if (uses12HourClock(locales)) {
    return compact(date.toLocaleTimeString(supported, { hour: 'numeric', minute: '2-digit' }));
  }
  return date.toLocaleTimeString(supported, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

/**
 * Locale-aware date/time with the browser's clock preference, for longer labels like alert times.
 * @param {number} ms epoch milliseconds
 * @param {Intl.DateTimeFormatOptions} options date parts to include
 * @returns {string}
 */
export const formatDateTime = (ms: number, options: Intl.DateTimeFormatOptions) => {
  const locales = browserLocales();
  return new Date(ms).toLocaleString(safeLocales(locales), {
    ...options,
    hourCycle: uses12HourClock(locales) ? 'h12' : 'h23',
  });
};
