import React from 'react';
import Container from 'react-bootstrap/Container';

import { makeid, timeDisplay, volumeDisplay } from '@/utilities';
import { DailyRow } from './components/DailyRow';
import './WeeklyForecast.less';

const precipitationData = (rainVolume, snowVolume) => {
  if (rainVolume.value == null && snowVolume.value == null) {
    rainVolume.value = 0;
  } else if (snowVolume.value != null && (rainVolume.value == null || snowVolume.value > rainVolume.value)) {
    return { type: 'Snow', value: volumeDisplay(snowVolume) };
  }
  return { type: 'Rain', value: volumeDisplay(rainVolume) };
};

const weeklyWeatherData = (data) => {
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

const getOverallMinTemp = (weeklyWeather) =>
  Math.min(...weeklyWeather.map((dailyWeather) => dailyWeather.minTemp.value));

const getOverallMaxTemp = (weeklyWeather) =>
  Math.max(...weeklyWeather.map((dailyWeather) => dailyWeather.maxTemp.value));

const DailyRows = ({ weeklyWeather }) => {
  const overallMin = getOverallMinTemp(weeklyWeather);
  const overallMax = getOverallMaxTemp(weeklyWeather);

  return weeklyWeather.map((dailyWeather, index) => {
    return (
      <DailyRow
        dailyWeather={dailyWeather}
        index={index}
        overallMinTemp={overallMin}
        overallMaxTemp={overallMax}
        key={`ww-${makeid()}`}
      />
    );
  });
};

export default class WeeklyForecast extends React.Component {
  render() {
    const { weatherData } = this.props;
    const weeklyWeather = weeklyWeatherData(weatherData);
    return (
      <Container className="weeklyForecast" fluid>
        <DailyRows weeklyWeather={weeklyWeather} />
      </Container>
    );
  }
}
