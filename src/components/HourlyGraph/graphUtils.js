export const VIEW_HOURS = 8;
export const TRACK_H = 52;

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export const num = (value) => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    const raw = value.value ?? value.magnitude;
    if (raw == null || raw === '') {
      return null;
    }
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * @param {Array<number|null|undefined>} values
 * @param {number} [pad]
 * @param {[number, number]} [fallback]
 * @returns {[number, number]}
 */
export const extent = (values, pad = 0, fallback = [0, 1]) => {
  const xs = values.filter((value) => value != null && Number.isFinite(value));
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
export const scaleY = (value, min, max, height, margin = 4) => {
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
export const polyline = (values, min, max, height) =>
  values
    .map((value, i) =>
      value == null || !Number.isFinite(value) ? null : `${i + 0.5},${scaleY(value, min, max, height)}`
    )
    .filter(Boolean)
    .join(' ');

export const conditionClass = (condition) => {
  switch (condition) {
    case 'RAIN':
    case 'SNOW':
    case 'SLEET':
      return 'rain';
    case 'PARTLY_CLOUDY':
      return 'partlyCloudy';
    case 'CLOUDY':
    case 'FOG':
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
export const hourIndexAt = (clientX, rect, hourCount, viewHours, scrollLeft) => {
  const paneWidth = rect.width * (hourCount / viewHours);
  const x = ((clientX - rect.left) / rect.width) * paneWidth + scrollLeft;
  const col = Math.floor((x / paneWidth) * hourCount);
  return Math.max(0, Math.min(hourCount - 1, col));
};
