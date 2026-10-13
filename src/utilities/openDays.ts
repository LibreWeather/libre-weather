import type { StorageCodec } from '@/models/storage';

export const OPEN_DAYS_KEY = 'openDays';

/** Stands for whichever day is currently first, so "keep Today open" carries over to tomorrow. */
export const TODAY = 'today';

const DEFAULT_OPEN_DAYS = [TODAY];

/** Local calendar date, e.g. `2026-10-13`; forecast days are matched to it so refreshed data keeps its rows open. */
export const dayKey = (time: number) => {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Drops dates before `now`'s day; their rows no longer exist. */
const prune = (days: string[], now: number) => {
  const today = dayKey(now);
  return days.filter((day, index) => days.indexOf(day) === index && (day === TODAY || day >= today));
};

export const loadOpenDays = (storage: Storage, now = Date.now()): string[] => {
  try {
    const saved = JSON.parse(storage.getItem(OPEN_DAYS_KEY) ?? 'null');
    if (Array.isArray(saved)) return prune(saved.filter((day) => typeof day === 'string'), now);
  } catch {
    // Corrupt JSON falls back to the default.
  }
  return DEFAULT_OPEN_DAYS;
};

export const saveOpenDays = (storage: Storage, days: string[], now = Date.now()) => {
  storage.setItem(OPEN_DAYS_KEY, JSON.stringify(prune(days, now)));
};

export const openDaysStore: StorageCodec<string[]> = {
  load: (storage) => loadOpenDays(storage),
  save: (storage, days) => saveOpenDays(storage, days),
};

export const isDayOpen = (days: string[], time: number, isToday: boolean) =>
  (isToday && days.includes(TODAY)) || days.includes(dayKey(time));

export const toggleDay = (days: string[], time: number, isToday: boolean) => {
  const key = dayKey(time);
  if (isDayOpen(days, time, isToday)) return days.filter((day) => day !== key && !(isToday && day === TODAY));
  return [...days, isToday ? TODAY : key];
};
