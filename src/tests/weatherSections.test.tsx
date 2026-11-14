import React from 'react';
import { render, screen } from '@testing-library/react';

import CurrentWeather from '@components/CurrentWeather';
import DailyOverview from '@components/DailyOverview';
import WeeklyForecast from '@components/WeeklyForecast';
import {
  Condition,
  PressureUnit,
  TempUnit,
  VisibilityUnit,
  VolumeUnit,
  WindUnit,
  type Current,
  type Daily,
  type Hourly,
} from '@/models/weather';
import { useCurrent, useDaily, useHourly } from '@/providers/ForecastProviders';
import { usePlace } from '@/providers/PlaceProvider';
import { usePreferences } from '@/providers/PreferencesProvider';

jest.mock('@/providers/ForecastProviders');
jest.mock('@/providers/PlaceProvider');
jest.mock('@/providers/PreferencesProvider');
jest.mock('@/hooks/useHero', () => ({
  useTrackHero: () => {},
  useHeroOffscreen: () => false,
}));
jest.mock('@/hooks/useHourLayout', () => ({
  useHourLayout: () => ({ stride: 1, narrow: false }),
}));
jest.mock('@/hooks/useOpenDays', () => ({
  useOpenDays: () => [[], () => {}],
}));

const useCurrentMock = useCurrent as jest.MockedFunction<typeof useCurrent>;
const useHourlyMock = useHourly as jest.MockedFunction<typeof useHourly>;
const useDailyMock = useDaily as jest.MockedFunction<typeof useDaily>;
const usePlaceMock = usePlace as jest.MockedFunction<typeof usePlace>;
const usePreferencesMock = usePreferences as jest.MockedFunction<typeof usePreferences>;

const current: Current = {
  apparentTemp: { value: 70, unit: TempUnit.F },
  condition: Condition.CLOUDY,
  description: 'Overcast',
  dewPoint: { value: 60, unit: TempUnit.F },
  humidity: 50,
  pressure: { value: 1010, unit: PressureUnit.MB },
  sunrise: 0,
  sunset: 0,
  temp: { value: 69, unit: TempUnit.F },
  time: Date.now(),
  visibility: { value: 10, unit: VisibilityUnit.MI },
  windspeed: { magnitude: 5, direction: 180, unit: WindUnit.MPH },
};

const hourly: Hourly[] = [
  {
    apparentTemp: { value: 70, unit: TempUnit.F },
    cloudCover: 50,
    condition: Condition.CLOUDY,
    description: 'Overcast',
    dewPoint: { value: 60, unit: TempUnit.F },
    humidity: 50,
    precipProbability: 0,
    precipVolume: { value: 0, unit: VolumeUnit.IN },
    pressure: { value: 1010, unit: PressureUnit.MB },
    rainVolume: { value: 0, unit: VolumeUnit.IN },
    snowVolume: { value: 0, unit: VolumeUnit.IN },
    sunshineDuration: 0,
    temp: { value: 68, unit: TempUnit.F },
    time: Date.now(),
    uvIndex: 0,
    visibility: { value: 10, unit: VisibilityUnit.MI },
    windspeed: { magnitude: 5, direction: 180, unit: WindUnit.MPH },
  },
];

const daily: Daily[] = [
  {
    condition: Condition.CLOUDY,
    description: 'Overcast',
    rainVolume: { value: 0, unit: VolumeUnit.IN },
    snowVolume: { value: 0, unit: VolumeUnit.IN },
    sunrise: 0,
    sunset: 0,
    temp: { min: { value: 50, unit: TempUnit.F }, max: { value: 70, unit: TempUnit.F } },
    time: Date.now(),
  },
];

const idleSlice = {
  status: 'loading' as const,
  stale: false,
  retry: jest.fn(),
};

beforeEach(() => {
  usePlaceMock.mockReturnValue({
    zip: '64106',
    locationName: 'Kansas City',
    useGeo: false,
    geoAvailable: false,
    coords: { lat: 39, lon: -94 },
    options: [],
    status: 'resolved',
    searchZip: jest.fn(),
    toggleGeo: jest.fn(),
    chooseLocation: jest.fn(),
  });
  usePreferencesMock.mockReturnValue({
    preferences: {} as never,
    setPreference: jest.fn(),
    resolved: {
      compact: false,
      reduceMotion: true,
      reduceTransparency: false,
      unitSystem: 'IMPERIAL' as never,
      windUnit: WindUnit.MPH,
      volumeUnit: VolumeUnit.IN,
      twelveHour: true,
    },
  });
  useCurrentMock.mockReturnValue({ current: null, ...idleSlice });
  useHourlyMock.mockReturnValue({ hourly: null, ...idleSlice });
  useDailyMock.mockReturnValue({ daily: null, ...idleSlice });
});

const Sections = () => (
  <>
    <CurrentWeather />
    <DailyOverview />
    <WeeklyForecast />
  </>
);

describe('independent forecast sections', () => {
  test('each section shows its own skeleton while loading', () => {
    const { container } = render(<Sections />);
    expect(container.querySelector('.weatherSkeleton-current')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-hourly')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-daily')).toBeInTheDocument();
    expect(screen.queryByText(/69/)).not.toBeInTheDocument();
  });

  test('hourly content paints while current and daily are still loading', () => {
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn() });
    const { container } = render(<Sections />);
    expect(container.querySelector('.weatherSkeleton-current')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-daily')).toBeInTheDocument();
    expect(container.querySelector('.dailyOverview')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-hourly')).not.toBeInTheDocument();
  });

  test('current content paints without waiting for hourly or daily', () => {
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn() });
    const { container } = render(<Sections />);
    expect(container.querySelector('.currentTemp')).toHaveTextContent('69');
    expect(container.querySelector('.weatherSkeleton-hourly')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-daily')).toBeInTheDocument();
  });

  test('daily content paints while current is still loading', () => {
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn() });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn() });
    const { container } = render(<Sections />);
    expect(container.querySelector('.weatherSkeleton-current')).toBeInTheDocument();
    expect(container.querySelector('.weeklyForecast')).toBeInTheDocument();
  });
});
