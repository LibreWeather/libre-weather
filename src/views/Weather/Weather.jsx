import React from 'react';
import CurrentWeather from '@components/CurrentWeather/CurrentWeather';
import DailyOverview from '@components/DailyOverview/DailyOverview';
import WeeklyForecast from '@components/WeeklyForecast/WeeklyForecast';

import './Weather.less';

export default class WeatherView extends React.Component {
  render() {
    const { weather } = this.props;
    return (
      <div className="header constrained hide-scroll">
        <CurrentWeather weatherData={weather} />
        <DailyOverview hourlyWeatherData={weather.hourly} />
        <WeeklyForecast weatherData={weather} />
      </div>
    );
  }
}
