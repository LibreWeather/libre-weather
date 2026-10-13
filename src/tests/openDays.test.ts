import { OPEN_DAYS_KEY, TODAY, dayKey, isDayOpen, loadOpenDays, saveOpenDays, toggleDay } from '@/utilities/openDays';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date(2026, 9, 13, 15).getTime();

describe('open days', () => {
  beforeEach(() => localStorage.clear());

  test('opens today by default', () => {
    expect(loadOpenDays(localStorage, now)).toEqual([TODAY]);
    expect(isDayOpen(loadOpenDays(localStorage, now), now, true)).toBe(true);
  });

  test('keys days by local calendar date', () => {
    expect(dayKey(now)).toBe('2026-10-13');
    expect(dayKey(new Date(2026, 0, 5, 23).getTime())).toBe('2026-01-05');
  });

  test('toggles later days by date and today by the today token', () => {
    let days = toggleDay([TODAY], now + DAY, false);
    expect(days).toEqual([TODAY, '2026-10-14']);
    days = toggleDay(days, now, true);
    expect(days).toEqual(['2026-10-14']);
    expect(toggleDay(days, now, true)).toEqual(['2026-10-14', TODAY]);
    expect(toggleDay(days, now + DAY, false)).toEqual([]);
  });

  test('a day opened in advance stays open once it becomes today', () => {
    const days = ['2026-10-14'];
    expect(isDayOpen(days, now + DAY, true)).toBe(true);
    expect(toggleDay(days, now + DAY, true)).toEqual([]);
  });

  test('round-trips through storage and prunes past dates', () => {
    saveOpenDays(localStorage, [TODAY, '2026-10-12', '2026-10-15', '2026-10-15'], now);
    expect(JSON.parse(localStorage.getItem(OPEN_DAYS_KEY)!)).toEqual([TODAY, '2026-10-15']);
    expect(loadOpenDays(localStorage, now + 3 * DAY)).toEqual([TODAY]);
  });

  test('keeps an empty list so closing everything sticks', () => {
    saveOpenDays(localStorage, [], now);
    expect(loadOpenDays(localStorage, now)).toEqual([]);
  });

  test('falls back to the default on bad data', () => {
    localStorage.setItem(OPEN_DAYS_KEY, '{nope');
    expect(loadOpenDays(localStorage, now)).toEqual([TODAY]);
    localStorage.setItem(OPEN_DAYS_KEY, JSON.stringify([1, '2026-10-14']));
    expect(loadOpenDays(localStorage, now)).toEqual(['2026-10-14']);
  });
});
