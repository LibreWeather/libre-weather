import { formatClock, formatHour, uses12HourClock } from '../utilities/locale';

const at = (hours: number, minutes = 0) => new Date(2026, 9, 13, hours, minutes).getTime();

describe('uses12HourClock', () => {
  test.each([
    [['en-US'], true],
    [['en-AU'], true],
    [['en-GB'], false],
    [['de-DE'], false],
    [['fr-CA'], false],
  ])('%j -> %s', (locales, expected) => {
    expect(uses12HourClock(locales)).toBe(expected);
  });
});

describe('formatHour', () => {
  test('compacts 12-hour labels', () => {
    expect(formatHour(at(0), ['en-US'])).toBe('12am');
    expect(formatHour(at(15), ['en-US'])).toBe('3pm');
  });

  test('uses zero-padded 24-hour labels', () => {
    expect(formatHour(at(0), ['en-GB'])).toBe('00:00');
    expect(formatHour(at(15), ['de-DE'])).toBe('15:00');
  });
});

describe('formatClock', () => {
  test('keeps noon and midnight as 12 on 12-hour clocks', () => {
    expect(formatClock(at(12, 5), ['en-US'])).toBe('12:05pm');
    expect(formatClock(at(0, 30), ['en-US'])).toBe('12:30am');
    expect(formatClock(at(7, 26), ['en-US'])).toBe('7:26am');
  });

  test('uses 24-hour time where the locale does', () => {
    expect(formatClock(at(18, 42), ['en-GB'])).toBe('18:42');
    expect(formatClock(at(7, 26), ['de-DE'])).toBe('07:26');
  });
});
