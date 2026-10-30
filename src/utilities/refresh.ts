/** Current conditions. Inside the 15–30 minute window, and past the API's 15-minute cache. */
export const CURRENT_REFRESH_MS = 20 * 60 * 1000;

/** Hourly series, the large payload. Short end of the 1–12 hour window, past the 45-minute API cache. */
export const HOURLY_REFRESH_MS = 60 * 60 * 1000;

/** Daily forecast. Long end of the 1–12 hour window, past the 6-hour API cache. */
export const DAILY_REFRESH_MS = 12 * 60 * 60 * 1000;
