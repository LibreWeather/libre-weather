import { barGeometry, extent, hourPosition, num, polyline, scaleY } from '@/utilities/graph';

test('num reads value and magnitude objects', () => {
  expect(num(12)).toBe(12);
  expect(num('8.5')).toBe(8.5);
  expect(num({ value: '70.20' })).toBe(70.2);
  expect(num({ magnitude: 11 })).toBe(11);
  expect(num(null)).toBeNull();
  expect(num({})).toBeNull();
});

test('extent pads and guards empty series', () => {
  expect(extent([])).toEqual([0, 1]);
  expect(extent([5, 5])).toEqual([4, 6]);
  expect(extent([0, 10], 0.1)).toEqual([-1, 11]);
});

test('scaleY maps max to the top margin', () => {
  expect(scaleY(10, 0, 10, 50, 5)).toBe(5);
  expect(scaleY(0, 0, 10, 50, 5)).toBe(45);
});

test('polyline skips nulls and centers each hour', () => {
  expect(polyline([0, null, 10], 0, 10, 50)).toBe('0,46 0.5,46 2.5,4 3,4');
});

test('polyline extends only to the edges of hours with data', () => {
  expect(polyline([null, 0, 10, null], 0, 10, 50)).toBe('1,46 1.5,46 2.5,4 3,4');
  expect(polyline([null, null], 0, 10, 50)).toBe('');
});

test('hourPosition places a timestamp within the hours shown', () => {
  const hour = 60 * 60 * 1000;
  const hours = [{ time: 0 }, { time: hour }, { time: 2 * hour }];
  expect(hourPosition(hours, 1.5 * hour)).toBe(1.5);
  expect(hourPosition(hours, -hour)).toBeNull();
  expect(hourPosition(hours, 3 * hour)).toBeNull();
  expect(hourPosition([], 0)).toBeNull();
});

test('barGeometry rises from the bottom of the track', () => {
  expect(barGeometry(100, 0, 100, 52)).toEqual({ top: 4, height: 44 });
  expect(barGeometry(0, 0, 100, 52).height).toBe(1);
});
