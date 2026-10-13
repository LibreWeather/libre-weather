import React from 'react';
import Container from 'react-bootstrap/Container';

import { useOpenDays } from '@/hooks/useOpenDays';
import type { ForecastDay } from '@/models/forecast';
import type { Hourly, Weather } from '@/models/weather';
import { forecastDays, hoursOnDay, tempBounds } from '@/utilities/forecast';
import { isDayOpen } from '@/utilities/openDays';
import { DailyRow } from './components/DailyRow';
import './WeeklyForecast.less';

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
  <Container className="weeklyForecast forecast-col" fluid>
    <DailyRows hourly={weatherData.hourly} weeklyWeather={forecastDays(weatherData)} />
  </Container>
);

export default WeeklyForecast;
