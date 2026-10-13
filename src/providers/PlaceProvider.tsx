import React from 'react';

import { geocode, reverseGeocode, type NominatimResponse } from '../utilities/nominatim';

const DEFAULT_ZIP = '64106';
const PENDING_NAME = 'Locating…';

export type Coords = { lat: number; lon: number };

export type PlaceStatus = 'resolving' | 'choosing' | 'resolved' | 'failed';

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

const nameFor = ({ address }: NominatimResponse) =>
  address.village || address.town || address.city || address.county || address.postcode;

export const PlaceProvider = ({ children }: { children: React.ReactNode }) => {
  const geoAvailable = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
  const [zip, setZip] = React.useState(() => localStorage.getItem('zip') || DEFAULT_ZIP);
  const [locationName, setLocationName] = React.useState(() => localStorage.getItem('locationName') || PENDING_NAME);
  const [useGeo, setUseGeo] = React.useState(() => geoAvailable && localStorage.getItem('useGeo') === 'true');
  const [coords, setCoords] = React.useState<Coords | null>(null);
  const [options, setOptions] = React.useState<NominatimResponse[]>([]);
  const [status, setStatus] = React.useState<PlaceStatus>('resolving');
  const requestId = React.useRef(0);

  const persistGeo = React.useCallback((value: boolean) => {
    setUseGeo(value);
    localStorage.setItem('useGeo', String(value));
  }, []);

  const applyMatch = React.useCallback((match: NominatimResponse) => {
    requestId.current++;
    const name = nameFor(match) || match.address.postcode || '';
    const postcode = match.address.postcode;
    localStorage.setItem('locationName', name);
    if (postcode) {
      localStorage.setItem('zip', postcode);
      setZip(postcode);
    }
    setLocationName(name);
    setOptions([]);
    setCoords({ lat: Number(match.lat), lon: Number(match.lon) });
    setStatus('resolved');
  }, []);

  const lookupZip = React.useCallback(
    (query: string) => {
      const id = ++requestId.current;
      const isCurrent = () => id === requestId.current;
      setStatus('resolving');
      geocode({ addressdetails: true, postalcode: query })
        .then((results) => {
          if (!isCurrent()) return;
          if (!results.length) {
            setStatus('failed');
          } else if (results.length > 1) {
            setOptions(results);
            setStatus('choosing');
          } else {
            applyMatch(results[0]);
          }
        })
        .catch((error) => {
          console.error(error);
          if (isCurrent()) setStatus('failed');
        });
    },
    [applyMatch]
  );

  const locate = React.useCallback(
    (fallbackZip: string) => {
      const id = ++requestId.current;
      const isCurrent = () => id === requestId.current;
      setStatus('resolving');
      navigator.geolocation.getCurrentPosition(
        ({ coords: position }) => {
          reverseGeocode({ lat: position.latitude, lon: position.longitude, addressdetails: true })
            .then((match) => {
              if (isCurrent()) applyMatch(match);
            })
            .catch((error) => {
              console.error(error);
              if (isCurrent()) setStatus('failed');
            });
        },
        () => {
          if (!isCurrent()) return;
          persistGeo(false);
          lookupZip(fallbackZip);
        }
      );
    },
    [applyMatch, lookupZip, persistGeo]
  );

  React.useEffect(() => {
    if (useGeo) {
      locate(zip);
    } else {
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
