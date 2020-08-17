/* globals fetch */

import React from 'react';
import CurrentWeather from './components/CurrentWeather';
import DailyOverview from './components/DailyOverview';
import DEFAULT_WEATHER_DATA from './resources/defaultWeatherData.json';
import LocationSearch from './components/LocationSearch';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: DEFAULT_WEATHER_DATA,
      units: 'IMPERIAL',
      lat: 37.8180061,
      lon: -96.8480188,
    };

    this.updateUnits = this.updateUnits.bind(this);
    this.updateWeather = this.updateWeather.bind(this);
  }

  updateUnits(units) {
    this.setState({ units });
    const { lat, lon } = this.state;
    this.updateWeather(lat, lon);
  }

  updateWeather(lat, lon) {
    this.setState({ lat, lon });

    const { units } = this.state;
    const headers = { 'x-latitude': lat, 'x-longitude': lon, 'x-unit': units };

    fetch(LIBRE_WEATHER_API_ROOT, { method: 'GET', headers })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ weather: data });
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  };

  render() {
    const { weather } = this.state;
    return (
      <div className="App">
        <LocationSearch updateWeather={this.updateWeather} updateUnits={this.updateUnits} />
        <header className="header">
          <CurrentWeather weatherData={this.state.weather}/>
          <DailyOverview weatherData={this.state.weather}/>
        </header>
      </div>
    );
  }
}

export default App;
