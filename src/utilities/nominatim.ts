export type NominatimAddress = {
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
};

export type NominatimResponse = {
  address: NominatimAddress;
  lat: string;
  lon: string;
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
