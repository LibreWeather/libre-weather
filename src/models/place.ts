export type Coords = { lat: number; lon: number };

export type PlaceStatus = 'resolving' | 'choosing' | 'resolved' | 'failed';

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

/** The last place the user picked, restored on the next visit. */
export type SavedPlace = {
  zip: string;
  locationName: string;
  coords: Coords | null;
  useGeo: boolean;
};
