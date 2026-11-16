import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

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
import Weather from '../views/Weather/Weather';
import { usePlace } from '@/providers/PlaceProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { Backend } from '@/utilities/backend';

jest.mock('@components/WeatherAlerts', () => ({
  __esModule: true,
  default: () => null,
  AlertsCoverageNote: () => null,
}));
jest.mock('@/providers/ForecastProviders', () => ({
  ...jest.requireActual('@/providers/ForecastProviders'),
  useCurrent: jest.fn(),
  useHourly: jest.fn(),
  useDaily: jest.fn(),
}));
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
  backend: null,
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
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    const { container } = render(<Sections />);
    expect(container.querySelector('.weatherSkeleton-current')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-daily')).toBeInTheDocument();
    expect(container.querySelector('.dailyOverview')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-hourly')).not.toBeInTheDocument();
  });

  test('current content paints without waiting for hourly or daily', () => {
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    const { container } = render(<Sections />);
    expect(container.querySelector('.currentTemp')).toHaveTextContent('69');
    expect(container.querySelector('.weatherSkeleton-hourly')).toBeInTheDocument();
    expect(container.querySelector('.weatherSkeleton-daily')).toBeInTheDocument();
  });

  test('daily content paints while current is still loading', () => {
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    const { container } = render(<Sections />);
    expect(container.querySelector('.weatherSkeleton-current')).toBeInTheDocument();
    expect(container.querySelector('.weeklyForecast')).toBeInTheDocument();
  });
});

const slice = (retry = jest.fn()) => ({ status: 'error' as const, stale: false, retry, backend: null });

describe('current headline', () => {
  test('description fills the summary slot when there is no summary', () => {
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    const { container } = render(<CurrentWeather />);
    expect(container.querySelector('.currentTemp')).toHaveTextContent('Overcast.');
    expect(container.querySelector('.currentDescription')).not.toBeInTheDocument();
    expect(container.querySelector('.currentMeta-description')).not.toBeInTheDocument();
  });

  test('description stays under the hero when a summary is present', () => {
    useCurrentMock.mockReturnValue({
      current: { ...current, summary: 'Cloudy' },
      status: 'ready',
      stale: false,
      retry: jest.fn(),
      backend: null,
    });
    const { container } = render(<CurrentWeather />);
    expect(container.querySelector('.currentTemp')).toHaveTextContent('Cloudy.');
    expect(container.querySelector('.currentTemp')).not.toHaveTextContent('Overcast');
    expect(container.querySelector('.currentDescription')).toHaveTextContent('Overcast.');
  });

  test('compact layout keeps the description in the meta row only when a summary is present', () => {
    usePreferencesMock.mockReturnValue({
      preferences: {} as never,
      setPreference: jest.fn(),
      resolved: {
        compact: true,
        reduceMotion: true,
        reduceTransparency: false,
        unitSystem: 'IMPERIAL' as never,
        windUnit: WindUnit.MPH,
        volumeUnit: VolumeUnit.IN,
        twelveHour: true,
      },
    });
    useCurrentMock.mockReturnValue({
      current: { ...current, summary: 'Cloudy' },
      status: 'ready',
      stale: false,
      retry: jest.fn(),
      backend: null,
    });
    const { container } = render(<CurrentWeather />);
    expect(container.querySelector('.currentDescription')).not.toBeInTheDocument();
    expect(container.querySelector('.currentMeta-description')).toHaveTextContent('Overcast.');
    expect(container.querySelector('.currentTemp')).toHaveTextContent('Cloudy.');
  });
});

describe('forecast outage and backend warning', () => {
  test('one alert retries every slice when the forecast is down', () => {
    const retryCurrent = jest.fn();
    const retryHourly = jest.fn();
    const retryDaily = jest.fn();
    useCurrentMock.mockReturnValue({ current: null, ...slice(retryCurrent) });
    useHourlyMock.mockReturnValue({ hourly: null, ...slice(retryHourly) });
    useDailyMock.mockReturnValue({ daily: null, ...slice(retryDaily) });
    render(<Weather />);
    expect(screen.getByRole('alert')).toHaveTextContent(/Couldn't load the forecast/);
    expect(screen.queryByText(/current conditions/)).not.toBeInTheDocument();
    expect(screen.queryByText(/hourly forecast/)).not.toBeInTheDocument();
    expect(screen.queryByText(/daily forecast/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryCurrent).toHaveBeenCalledTimes(1);
    expect(retryHourly).toHaveBeenCalledTimes(1);
    expect(retryDaily).toHaveBeenCalledTimes(1);
  });

  test('a single slice error stays on that section', () => {
    useCurrentMock.mockReturnValue({ current: null, ...slice() });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn(), backend: null });
    render(<Weather />);
    expect(screen.getByRole('alert')).toHaveTextContent('current conditions');
    expect(screen.queryByText(/Couldn't load the forecast/)).not.toBeInTheDocument();
  });

  test('warns when the served backend disagrees and still shows the forecast', () => {
    usePreferencesMock.mockReturnValue({
      preferences: { backend: Backend.PIRATE, backendKey: 'pw-key' } as never,
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
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    const { container } = render(<Weather />);
    expect(screen.getByRole('status')).toHaveTextContent('Pirate Weather settings were not used');
    expect(screen.getByRole('status')).toHaveTextContent('Open-Meteo');
    expect(container.querySelector('.currentTemp')).toHaveTextContent('69');
  });

  test('a matching backend and the server default show no warning', () => {
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.METEO });
    const { unmount } = render(<Weather />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unmount();

    usePreferencesMock.mockReturnValue({
      preferences: { backend: Backend.PIRATE, backendKey: 'pw-key' } as never,
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
    useCurrentMock.mockReturnValue({ current, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.PIRATE });
    useHourlyMock.mockReturnValue({ hourly, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.PIRATE });
    useDailyMock.mockReturnValue({ daily, status: 'ready', stale: false, retry: jest.fn(), backend: Backend.PIRATE });
    render(<Weather />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
