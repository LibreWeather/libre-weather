import React from 'react';

import { geocodeRequest, reverseRequest } from '@/api/nominatim';
import { useFetch } from '@/hooks/useFetch';
import { useStorage } from '@/hooks/useStorage';
import type { Coords, NominatimResponse, PlaceStatus } from '@/models/place';
import { matchCoords, placeName, placeStore } from '@/utilities/place';

const DEFAULT_ZIP = '64106';
const PENDING_NAME = 'Locating…';

export type PlaceContextValue = {
  zip: string;
  locationName: string;
  useGeo: boolean;
  geoAvailable: boolean;
  coords: Coords | null;
  options: NominatimResponse[];
  status: PlaceStatus;
  searchZip: (zip: string) => void;
  toggleGeo: () => void;
  chooseLocation: (option: NominatimResponse) => void;
};

const PlaceContext = React.createContext<PlaceContextValue | null>(null);

const logError = (error: Error) => console.error(error);

export const PlaceProvider = ({ children }: { children: React.ReactNode }) => {
  const geoAvailable = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
  const [saved, setSaved] = useStorage(placeStore);
  const useGeo = geoAvailable && saved.useGeo;
  const [zip, setZip] = React.useState(saved.zip || DEFAULT_ZIP);
  const [initialCoords] = React.useState(() => (useGeo ? null : saved.coords));
  const [coords, setCoords] = React.useState<Coords | null>(initialCoords);
  const [options, setOptions] = React.useState<NominatimResponse[]>([]);
  const [status, setStatus] = React.useState<PlaceStatus>(initialCoords ? 'resolved' : 'resolving');
  const [, geocode] = useFetch<NominatimResponse[]>(null, { manual: true, onError: logError });
  const [, reverseGeocode] = useFetch<NominatimResponse>(null, { manual: true, onError: logError });
  // Geolocation isn't a fetch, so overlapping lookups are told apart by id rather than by aborting.
  const requestId = React.useRef(0);

  const persistGeo = React.useCallback(
    (value: boolean) => setSaved((place) => ({ ...place, useGeo: value })),
    [setSaved]
  );

  const applyMatch = React.useCallback(
    (match: NominatimResponse) => {
      requestId.current++;
      const name = placeName(match);
      const postcode = match.address.postcode;
      const nextCoords = matchCoords(match);
      setSaved((place) => ({ ...place, locationName: name, coords: nextCoords, zip: postcode || place.zip }));
      if (postcode) setZip(postcode);
      setOptions([]);
      setCoords(nextCoords);
      setStatus('resolved');
    },
    [setSaved]
  );

  const lookupZip = React.useCallback(
    async (query: string) => {
      const id = ++requestId.current;
      setStatus('resolving');
      const results = await geocode(geocodeRequest(query));
      if (id !== requestId.current) return;
      if (!results?.length) {
        setStatus('failed');
      } else if (results.length > 1) {
        setOptions(results);
        setStatus('choosing');
      } else {
        applyMatch(results[0]);
      }
    },
    [applyMatch, geocode]
  );

  const locate = React.useCallback(
    (fallbackZip: string) => {
      const id = ++requestId.current;
      const isCurrent = () => id === requestId.current;
      setStatus('resolving');
      navigator.geolocation.getCurrentPosition(
        async ({ coords: position }) => {
          const match = await reverseGeocode(reverseRequest(position.latitude, position.longitude));
          if (!isCurrent()) return;
          if (match) applyMatch(match);
          else setStatus('failed');
        },
        () => {
          if (!isCurrent()) return;
          persistGeo(false);
          lookupZip(fallbackZip);
        }
      );
    },
    [applyMatch, lookupZip, persistGeo, reverseGeocode]
  );

  React.useEffect(() => {
    if (useGeo) {
      locate(zip);
    } else if (!initialCoords) {
      lookupZip(zip);
    }
    // Resolve once on mount; later changes go through the actions below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchZip = React.useCallback(
    (query: string) => {
      persistGeo(false);
      setZip(query);
      lookupZip(query);
    },
    [lookupZip, persistGeo]
  );

  const toggleGeo = React.useCallback(() => {
    if (useGeo) {
      persistGeo(false);
      lookupZip(zip);
    } else {
      persistGeo(true);
      locate(zip);
    }
  }, [useGeo, zip, persistGeo, lookupZip, locate]);

  const locationName = saved.locationName || PENDING_NAME;

  const value = React.useMemo<PlaceContextValue>(
    () => ({
      zip,
      locationName,
      useGeo,
      geoAvailable,
      coords,
      options,
      status,
      searchZip,
      toggleGeo,
      chooseLocation: applyMatch,
    }),
    [zip, locationName, useGeo, geoAvailable, coords, options, status, searchZip, toggleGeo, applyMatch]
  );

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>;
};

export const usePlace = () => {
  const context = React.useContext(PlaceContext);
  if (!context) throw new Error('usePlace must be used inside a PlaceProvider');
  return context;
};
