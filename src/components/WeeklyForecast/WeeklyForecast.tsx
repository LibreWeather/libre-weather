import React from 'react';

import ForecastError from '@components/ForecastError';
import { DailySkeleton } from '@components/WeatherSkeleton';
import { useOpenDays } from '@/hooks/useOpenDays';
import type { ForecastDay } from '@/models/forecast';
import type { Hourly } from '@/models/weather';
import { useDaily, useHourly } from '@/providers/ForecastProviders';
import { usePlace } from '@/providers/PlaceProvider';
import { forecastDays, hoursOnDay, tempBounds } from '@/utilities/forecast';
import { isDayOpen } from '@/utilities/openDays';
import { DailyRow } from './components/DailyRow';

const DailyRows = ({ weeklyWeather, hourly }: { weeklyWeather: ForecastDay[]; hourly: Hourly[] }) => {
  const [openDays, toggle] = useOpenDays();
  const { min, max } = tempBounds(weeklyWeather);

  return weeklyWeather.map((dailyWeather, index) => {
    const isToday = index === 0;
    return (
      <DailyRow
        dailyWeather={dailyWeather}
        hourly={hoursOnDay(hourly, dailyWeather.time)}
        index={index}
        open={isDayOpen(openDays, dailyWeather.time, isToday)}
        onToggle={() => toggle(dailyWeather.time, isToday)}
        key={`ww-${dailyWeather.time}-${index}`}
        overallMinTemp={min}
        overallMaxTemp={max} />
    );
  });
};

const WeeklyForecast = () => {
  const { daily, status, retry } = useDaily();
  const { hourly } = useHourly();
  const place = usePlace();

  if (!daily && status === 'error') {
    return <ForecastError onRetry={retry} label="the daily forecast" />;
  }

  if (!daily) {
    return <DailySkeleton animated={status === 'loading' || place.status === 'resolving'} />;
  }

  const refreshing = status === 'loading';
  return (
    <div
      className={
        'weeklyForecast forecast-col mt-[2em] rounded-xl border border-white/8 bg-clear/45 px-3 py-1.5 text-base ' +
        'max-md:mt-[1em] max-md:py-1 compact:mt-[1em] transition-opacity duration-200 ' +
        `${refreshing ? 'is-refreshing opacity-60' : ''}`
      }
      aria-busy={refreshing}>
      <DailyRows hourly={hourly ?? []} weeklyWeather={forecastDays(daily)} />
    </div>
  );
};

export default WeeklyForecast;
