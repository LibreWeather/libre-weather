import type { Coords, NominatimAddress, NominatimResponse, SavedPlace } from '@/models/place';
import type { StorageCodec } from '@/models/storage';

/** Short name for the navbar, e.g. "Kansas City"; the postcode when there's no named place. */
export const placeName = ({ address }: NominatimResponse) =>
  address.village || address.town || address.city || address.county || address.postcode || '';

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

export const matchCoords = (match: NominatimResponse): Coords => ({ lat: Number(match.lat), lon: Number(match.lon) });

const parseCoords = (raw: string | null): Coords | null => {
  try {
    const saved = JSON.parse(raw ?? 'null');
    return Number.isFinite(saved?.lat) && Number.isFinite(saved?.lon) ? { lat: saved.lat, lon: saved.lon } : null;
  } catch {
    return null;
  }
};

/** Kept as separate keys, as they were before this was one object. */
export const placeStore: StorageCodec<SavedPlace> = {
  load: (storage) => ({
    zip: storage.getItem('zip') || '',
    locationName: storage.getItem('locationName') || '',
    coords: parseCoords(storage.getItem('coords')),
    useGeo: storage.getItem('useGeo') === 'true',
  }),
  save: (storage, { zip, locationName, coords, useGeo }) => {
    if (zip) storage.setItem('zip', zip);
    if (locationName) storage.setItem('locationName', locationName);
    if (coords) storage.setItem('coords', JSON.stringify(coords));
    storage.setItem('useGeo', String(useGeo));
  },
};
