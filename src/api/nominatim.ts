const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

type Params = Record<string, string | number | boolean | null | undefined>;

/** Nominatim wants JSON output and booleans as `1`/`0`; unset values are left out. */
const toParams = (data: Params) => {
  const params = new URLSearchParams({ format: 'json' });
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, typeof value === 'boolean' ? Number(value).toString() : String(value));
  });
  return params;
};

/** Places matching a postal code; resolves to a `NominatimResponse[]`. */
export const geocodeRequest = (postalcode: string) =>
  `${NOMINATIM_URL}/search?${toParams({ addressdetails: true, postalcode })}`;

/** The place at a point; resolves to a `NominatimResponse`. */
export const reverseRequest = (lat: number, lon: number) =>
  `${NOMINATIM_URL}/reverse?${toParams({ lat, lon, addressdetails: true })}`;
