import React from 'react';

import CurrentWeather from '../components/CurrentWeather';
import DailyOverview from '../components/DailyOverview';
import WeeklyForecast from '../components/WeeklyForecast';

export default class WeatherView extends React.Component {
  render() {
    const weather = this.props;
    return (
      <header className="header">
        <CurrentWeather weatherData={weather} />
        <DailyOverview hourlyWeatherData={weather.hourly} />
        <WeeklyForecast weatherData={weather} />
      </header>
    );
  }
}