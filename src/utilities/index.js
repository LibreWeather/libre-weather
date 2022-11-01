const makeid = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export default makeid;

/**
 * Get the numeric hours from a timestamp
 * @param {Date|string|number} timestamp date-resolvable
 * @returns {string}
 */
export const getHourFromTimestamp = (timestamp) => {
  return new Date(timestamp * 1000)
    .toLocaleTimeString({}, { hour12: true, hour: 'numeric' })
    .toLowerCase()
    .replace(/ /g, '');
};
