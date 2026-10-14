import React from 'react';

import { useOpenDays } from '@/hooks/useOpenDays';
import type { ForecastDay } from '@/models/forecast';
import type { Hourly, Weather } from '@/models/weather';
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

const WeeklyForecast = ({ weatherData }: { weatherData: Weather }) => (
  <div
    className={
      'weeklyForecast forecast-col mt-[2em] rounded-xl border border-white/8 bg-clear/45 px-3 py-1.5 text-base ' +
      'max-md:mt-[1em] max-md:py-1 compact:mt-[1em]'
    }>
    <DailyRows hourly={weatherData.hourly} weeklyWeather={forecastDays(weatherData)} />
  </div>
);

export default WeeklyForecast;
