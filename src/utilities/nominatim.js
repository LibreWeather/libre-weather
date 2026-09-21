const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * @typedef {object} NominatimAddress
 * @property {string} [village]
 * @property {string} [town]
 * @property {string} [city]
 * @property {string} [county]
 * @property {string} [postcode]
 * @property {string} [country]
 */

/**
 * @typedef {object} NominatimResponse
 * @property {NominatimAddress} address
 * @property {string} lat
 * @property {string} lon
 */

const toParams = (data = {}) => {
  const params = new URLSearchParams({ format: 'json' });
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params.set(key, typeof value === 'boolean' ? Number(value).toString() : String(value));
  });
  return params;
};

const nominatimGet = async (path, data) => {
  const res = await fetch(`${NOMINATIM_URL}/${path}?${toParams(data)}`);
  if (!res.ok) {
    throw new Error(`Nominatim ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

/** @param {Record<string, unknown>} data */
export const geocode = (data) => nominatimGet('search', data);

/** @param {Record<string, unknown>} data */
export const reverseGeocode = (data) => nominatimGet('reverse', data);
