import { Condition } from '@/utilities/weatherTypes';

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
export const polyline = (values: Array<number | null>, min: number, max: number, height: number) =>
  values
    .map((value, i) =>
      value == null || !Number.isFinite(value) ? null : `${i + 0.5},${scaleY(value, min, max, height)}`
    )
    .filter(Boolean)
    .join(' ');

export const conditionClass = (condition: Condition) => {
  switch (condition) {
    case Condition.RAIN:
    case Condition.SNOW:
    case Condition.SLEET:
      return 'rain';
    case Condition.PARTLY_CLOUDY:
      return 'partlyCloudy';
    case Condition.CLOUDY:
    case Condition.FOG:
      return 'mostlyCloudy';
    default:
      return 'clear';
  }
};

/**
 * Map pointer x in a pane to an hour index.
 * @param {number} clientX
 * @param {DOMRect} rect
 * @param {number} hourCount
 * @param {number} viewHours
 * @param {number} scrollLeft
 * @returns {number}
 */
export const hourIndexAt = (
  clientX: number,
  rect: Pick<DOMRect, 'left' | 'width'>,
  hourCount: number,
  viewHours: number,
  scrollLeft: number
) => {
  const paneWidth = rect.width * (hourCount / viewHours);
  const x = ((clientX - rect.left) / rect.width) * paneWidth + scrollLeft;
  const col = Math.floor((x / paneWidth) * hourCount);
  return Math.max(0, Math.min(hourCount - 1, col));
};
