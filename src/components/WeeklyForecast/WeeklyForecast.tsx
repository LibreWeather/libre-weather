import React from 'react';
import Container from 'react-bootstrap/Container';

import { timeDisplay, volumeDisplay } from '@/utilities';
import { isDayOpen, loadOpenDays, saveOpenDays, toggleDay } from '@/utilities/openDays';
import type { Hourly, Temperature, Volume, Weather } from '@/utilities/weatherTypes';
import { DailyRow, type DailyRowWeather } from './components/DailyRow';
import './WeeklyForecast.less';

const precipitationData = (rainVolume: Volume, snowVolume: Volume) => {
  if (rainVolume.value == null && snowVolume.value == null) {
    rainVolume.value = 0;
  } else if (snowVolume.value != null && (rainVolume.value == null || snowVolume.value > rainVolume.value)) {
    return { type: 'Snow', value: volumeDisplay(snowVolume) };
  }
  return { type: 'Rain', value: volumeDisplay(rainVolume) };
};

const weeklyWeatherData = (data: Weather): DailyRowWeather[] => {
  const { daily } = data;
  return daily.slice(0, 7).map(({ condition, description, rainVolume, snowVolume, sunrise, sunset, temp, time }) => {
    const { max, min } = temp;
    return {
      condition,
      description,
      minTemp: min,
      maxTemp: max,
      precipitation: precipitationData(rainVolume, snowVolume),
      sunrise: timeDisplay(sunrise),
      sunset: timeDisplay(sunset),
      time,
    };
  });
};

const hoursOnDay = (hourly: Hourly[] | undefined, dayTime: number) => {
  const day = new Date(dayTime);
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  const matched = (hourly || []).filter((hour) => {
    const at = new Date(hour.time);
    return at.getFullYear() === year && at.getMonth() === month && at.getDate() === date;
  });
  if (matched.length) {
    return matched;
  }
  const from = dayTime;
  const to = dayTime + 24 * 60 * 60 * 1000;
  return (hourly || []).filter((hour) => hour.time >= from && hour.time < to);
};

const getOverallMinTemp = (weeklyWeather: DailyRowWeather[]) =>
  Math.min(...weeklyWeather.map((dailyWeather) => Number(dailyWeather.minTemp.value)));

const getOverallMaxTemp = (weeklyWeather: DailyRowWeather[]) =>
  Math.max(...weeklyWeather.map((dailyWeather) => Number(dailyWeather.maxTemp.value)));

/** Which days are expanded, kept in localStorage so they survive refreshes and reloads. */
const useOpenDays = () => {
  const [openDays, setOpenDays] = React.useState(() => loadOpenDays(localStorage));
  const toggle = React.useCallback((time: number, isToday: boolean) => {
    setOpenDays((current) => {
      const next = toggleDay(current, time, isToday);
      saveOpenDays(localStorage, next);
      return next;
    });
  }, []);
  return [openDays, toggle] as const;
};

const DailyRows = ({ weeklyWeather, hourly }: { weeklyWeather: DailyRowWeather[]; hourly: Hourly[] }) => {
  const [openDays, toggle] = useOpenDays();
  const overallMin = getOverallMinTemp(weeklyWeather);
  const overallMax = getOverallMaxTemp(weeklyWeather);

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
        overallMinTemp={overallMin}
        overallMaxTemp={overallMax} />
    );
  });
};

const WeeklyForecast = ({ weatherData }: { weatherData: Weather }) => (
  <Container className="weeklyForecast forecast-col" fluid>
    <DailyRows hourly={weatherData.hourly} weeklyWeather={weeklyWeatherData(weatherData)} />
  </Container>
);

export default WeeklyForecast;
