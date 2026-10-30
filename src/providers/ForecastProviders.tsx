import React from 'react';

import type { LoadStatus } from '@/models/status';
import type { Current, Daily, Hourly } from '@/models/weather';
import CurrentDayContext from './CurrentDayContext';
import { useCurrentData, useDailyData, useHourlyData } from './forecastSlice';

export type CurrentContextValue = {
  current: Current | null;
  status: LoadStatus;
  stale: boolean;
  retry: () => void;
};

const CurrentContext = React.createContext<CurrentContextValue | null>(null);

export const CurrentProvider = ({ children }: { children: React.ReactNode }) => {
  const { value, day } = useCurrentData();
  return (
    <CurrentContext.Provider value={value}>
      <CurrentDayContext.Provider value={day}>{children}</CurrentDayContext.Provider>
    </CurrentContext.Provider>
  );
};

export const useCurrent = () => {
  const context = React.useContext(CurrentContext);
  if (!context) throw new Error('useCurrent must be used inside a CurrentProvider');
  return context;
};

export type HourlyContextValue = {
  hourly: Hourly[] | null;
  status: LoadStatus;
  stale: boolean;
  retry: () => void;
};

const HourlyContext = React.createContext<HourlyContextValue | null>(null);

export const HourlyProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useHourlyData();
  return <HourlyContext.Provider value={value}>{children}</HourlyContext.Provider>;
};

export const useHourly = () => {
  const context = React.useContext(HourlyContext);
  if (!context) throw new Error('useHourly must be used inside an HourlyProvider');
  return context;
};

export type DailyContextValue = {
  daily: Daily[] | null;
  status: LoadStatus;
  stale: boolean;
  retry: () => void;
};

const DailyContext = React.createContext<DailyContextValue | null>(null);

export const DailyProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useDailyData();
  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
};

export const useDaily = () => {
  const context = React.useContext(DailyContext);
  if (!context) throw new Error('useDaily must be used inside a DailyProvider');
  return context;
};
