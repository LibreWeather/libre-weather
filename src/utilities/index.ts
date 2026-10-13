import { formatHour } from './locale';

export const makeid = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export default makeid;

/**
 * Short hour label in the browser's clock format, e.g. `3pm` or `15:00`
 * @param {Date|string|number} timestamp date-resolvable
 * @returns {string}
 */
export const getHourFromTimestamp = (timestamp: Date | string | number) => formatHour(timestamp);

export * from './formatters';
