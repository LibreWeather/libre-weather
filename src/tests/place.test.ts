import type { NominatimResponse } from '@/models/place';
import { placeLabel, placeName, placeStore } from '@/utilities/place';

const match = (address: NominatimResponse['address']) => ({ address, lat: '1', lon: '2' });

describe('place', () => {
  beforeEach(() => localStorage.clear());

  test('names prefer the most specific place, then the postcode', () => {
    expect(placeName(match({ town: 'Smallville', county: 'Lowell' }))).toBe('Smallville');
    expect(placeName(match({ postcode: '66002' }))).toBe('66002');
    expect(placeLabel({ city: 'Kansas City', state: 'Missouri', country: 'United States' })).toBe(
      'Kansas City, Missouri, United States'
    );
  });

  test('the store keeps the separate keys and ignores bad coords', () => {
    placeStore.save(localStorage, { zip: '64106', locationName: 'Kansas City', coords: { lat: 1, lon: 2 }, useGeo: true });
    expect(localStorage.getItem('zip')).toBe('64106');
    expect(localStorage.getItem('useGeo')).toBe('true');
    expect(placeStore.load(localStorage).coords).toEqual({ lat: 1, lon: 2 });
    localStorage.setItem('coords', '{"lat":"x"}');
    expect(placeStore.load(localStorage).coords).toBeNull();
  });
});
