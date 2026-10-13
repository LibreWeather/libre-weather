import { useCallback } from 'react';
import { openDaysStore, toggleDay } from '@/utilities/openDays';
import { useStorage } from './useStorage';

/** Which forecast days are expanded, kept in localStorage so they survive refreshes and reloads. */
export const useOpenDays = () => {
  const [openDays, setOpenDays] = useStorage(openDaysStore);
  const toggle = useCallback(
    (time: number, isToday: boolean) => setOpenDays((current) => toggleDay(current, time, isToday)),
    [setOpenDays]
  );
  return [openDays, toggle] as const;
};
