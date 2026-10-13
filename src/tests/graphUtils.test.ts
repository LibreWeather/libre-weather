import { extent, hourIndexAt, num, polyline, scaleY, VIEW_HOURS } from '@components/HourlyGraph/graphUtils';

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
  expect(polyline([0, null, 10], 0, 10, 50)).toBe('0.5,46 2.5,4');
});

test('hourIndexAt maps 8-hour viewport to column', () => {
  const rect = { left: 0, width: 80 };
  expect(hourIndexAt(10, rect, 24, VIEW_HOURS, 0)).toBe(3);
  expect(hourIndexAt(10, rect, 24, VIEW_HOURS, 80)).toBe(11);
});
