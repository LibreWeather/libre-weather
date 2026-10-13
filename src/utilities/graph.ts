import type { Hourly } from '@/models/weather';
import { HOUR } from './time';

export const VIEW_HOURS = 8;
export const TRACK_H = 52;

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export const num = (value: unknown): number | null => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    const raw = (value as { value?: unknown; magnitude?: unknown }).value ??
      (value as { magnitude?: unknown }).magnitude;
    if (raw == null || raw === '') {
      return null;
    }
    const parsed = Number.parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

export const extent = (
  values: Array<number | null | undefined>,
  pad = 0,
  fallback: [number, number] = [0, 1]
): [number, number] => {
  const xs = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!xs.length) {
    return fallback;
  }
  let min = Math.min(...xs);
  let max = Math.max(...xs);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const extra = (max - min) * pad;
  return [min - extra, max + extra];
};

/**
 * @param {number|null} value
 * @param {number} min
 * @param {number} max
 * @param {number} height
 * @param {number} [margin]
 * @returns {number}
 */
export const scaleY = (value: number | null, min: number, max: number, height: number, margin = 4) => {
  if (value == null || !Number.isFinite(value) || max === min) {
    return height / 2;
  }
  const t = (value - min) / (max - min);
  return margin + (1 - t) * (height - margin * 2);
};

/**
 * @param {Array<number|null>} values
 * @param {number} min
 * @param {number} max
 * @param {number} height
 * @returns {string}
 */
export const polyline = (values: Array<number | null>, min: number, max: number, height: number) => {
  const points = values.flatMap((value, i) =>
    value == null || !Number.isFinite(value) ? [] : [[i + 0.5, scaleY(value, min, max, height)]]
  );
  if (!points.length) {
    return '';
  }
  const [firstX, firstY] = points[0];
  const [lastX, lastY] = points[points.length - 1];
  return [[firstX - 0.5, firstY], ...points, [lastX + 0.5, lastY]].map(([x, y]) => `${x},${y}`).join(' ');
};

/**
 * Fractional column for a timestamp, or null when it falls outside the hours shown.
 * @param {Array<{ time: number }>} hours
 * @param {number} at
 * @returns {number|null}
 */
export const hourPosition = (hours: Array<{ time: number }>, at: number) => {
  if (!hours.length) {
    return null;
  }
  const pos = (at - hours[0].time) / HOUR;
  return pos > 0 && pos < hours.length ? pos : null;
};

/** Top and height of a bar rising from the bottom of a track, scaled to `min`–`max`. */
export const barGeometry = (value: number, min: number, max: number, height = TRACK_H) => {
  const top = 4 + ((max - value) / (max - min || 1)) * (height - 8);
  return { top, height: Math.max(1, height - 4 - top) };
};

/** Lower bound pulled down to zero, for series that should sit on a zero baseline. */
const fromZero = ([min, max]: [number, number]): [number, number] => [Math.min(0, min), max];

/** Every series, range and line the hourly graph draws, derived from the hours shown. */
export const buildChart = (hours: Hourly[]) => {
  const series = (pick: (hour: Hourly) => unknown) => hours.map((hour) => num(pick(hour)));
  const temps = series((h) => h.temp);
  const feels = series((h) => h.apparentTemp);
  const dew = series((h) => h.dewPoint);
  const pops = series((h) => h.precipProbability);
  const precips = series((h) => h.precipVolume);
  const winds = series((h) => h.windspeed);
  const gusts = series((h) => h.windGust);
  const hums = series((h) => h.humidity);
  const clouds = series((h) => h.cloudCover);
  const uvs = series((h) => h.uvIndex);
  const suns = series((h) => h.sunshineDuration).map((s) => (s == null ? null : (s / 3600) * 100));
  const pressures = series((h) => h.pressure);
  const vis = series((h) => h.visibility);

  const tempExt = extent([...temps, ...feels, ...dew], 0.08);
  const precipExt = fromZero(extent(precips.filter((v) => v != null), 0.1, [0, 0.2]));
  const windExt = fromZero(extent([...winds, ...gusts], 0.08, [0, 10]));
  const uvExt: [number, number] = [0, extent(uvs, 0.08, [0, 11])[1]];
  const pressureExt = extent(pressures, 0.08, [1000, 1020]);
  const visExt = fromZero(extent(vis, 0.08, [0, 10]));

  return {
    count: hours.length,
    pops,
    uvs,
    tempExt,
    precipExt,
    windExt,
    uvExt,
    pressureExt,
    tempLine: polyline(temps, ...tempExt, TRACK_H),
    feelsLine: polyline(feels, ...tempExt, TRACK_H),
    dewLine: polyline(dew, ...tempExt, TRACK_H),
    precipLine: polyline(precips, ...precipExt, TRACK_H),
    windLine: polyline(winds, ...windExt, TRACK_H),
    gustLine: polyline(gusts, ...windExt, TRACK_H),
    humLine: polyline(hums, 0, 100, TRACK_H),
    cloudLine: polyline(clouds, 0, 100, TRACK_H),
    sunLine: polyline(suns, 0, 100, TRACK_H),
    pressureLine: polyline(pressures, ...pressureExt, TRACK_H),
    visLine: polyline(vis, ...visExt, TRACK_H),
  };
};

export type HourlyChart = ReturnType<typeof buildChart>;
