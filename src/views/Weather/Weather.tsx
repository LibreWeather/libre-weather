import React from 'react';
import CurrentWeather from '@components/CurrentWeather/CurrentWeather';
import DailyOverview from '@components/DailyOverview/DailyOverview';
import WeeklyForecast from '@components/WeeklyForecast/WeeklyForecast';
import type { Weather } from '@/utilities/weatherTypes';

import './Weather.less';

type WeatherViewProps = {
  weather: Weather;
};

export default class WeatherView extends React.Component<WeatherViewProps> {
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
