export type NominatimAddress = {
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export type NominatimResponse = {
  place_id?: number;
  address: NominatimAddress;
  lat: string;
  lon: string;
};

/**
 * Human-readable label for a geocoding match, specific enough to tell matches apart.
 * @param {NominatimAddress} [address] match address
 * @returns {string | undefined} label such as "Kansas City, Missouri, United States"
 */
export const placeLabel = (address: NominatimAddress | undefined) => {
  if (!address) {
    return undefined;
  }
  const { village, town, city, county, state, postcode, country } = address;
  const place = village || town || city || county;
  if (!place) {
    return postcode;
  }
  return [place, state, country].filter(Boolean).join(', ');
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const toParams = (data: Record<string, unknown> = {}) => {
  const params = new URLSearchParams({ format: 'json' });
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params.set(key, typeof value === 'boolean' ? Number(value).toString() : String(value));
  });
  return params;
};

const nominatimGet = async (path: string, data: Record<string, unknown>) => {
  const res = await fetch(`${NOMINATIM_URL}/${path}?${toParams(data)}`);
  if (!res.ok) {
    throw new Error(`Nominatim ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const geocode = (data: Record<string, unknown>): Promise<NominatimResponse[]> =>
  nominatimGet('search', data);

export const reverseGeocode = (data: Record<string, unknown>): Promise<NominatimResponse> =>
  nominatimGet('reverse', data);
