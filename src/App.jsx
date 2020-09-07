/* globals fetch */

import React from 'react';
import CurrentWeather from './components/CurrentWeather';
import DailyOverview from './components/DailyOverview';
import DEFAULT_WEATHER_DATA from './resources/defaultWeatherData.json';
import NavigationBar from './components/NavigationBar';
import CurrentDayContext from './utilities/CurrentDayContext';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;
const DEFAULT_UNITS = 'IMPERIAL';
const DEFAULT_LAT = 37.8180061;
const DEFAULT_LON = -96.8480188;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: DEFAULT_WEATHER_DATA,
      units: DEFAULT_UNITS,
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
    };

    this.setUnits = this.setUnits.bind(this);
    this.setLatLon = this.setLatLon.bind(this);
    this.setWeather = this.setWeather.bind(this);
  }

  setWeather(lat, lon, units) {
    const headers = { 'x-latitude': lat, 'x-longitude': lon, 'x-unit': units };

    fetch(LIBRE_WEATHER_API_ROOT, { method: 'GET', headers })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ weather: data });
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  setUnits(units) {
    this.setState({ units });
    const { lat, lon } = this.state;
    this.setWeather(lat, lon, units);
  }

  setLatLon(lat, lon) {
    this.setState({ lat, lon });
    const { units } = this.state;
    this.setWeather(lat, lon, units);
  }

  render() {
    const { weather } = this.state;
    const currentDayData = {
      sunrise: weather.current.sunrise,
      sunset: weather.current.sunset,
      time: weather.current.time,
    };
    return (
      <CurrentDayContext.Provider value={currentDayData}>
        <div className="App">
          <NavigationBar setLatLon={this.setLatLon} setUnits={this.setUnits} />
          <header className="header">
            <CurrentWeather weatherData={weather} />
            <DailyOverview weatherData={weather} />
          </header>
        </div>
      </CurrentDayContext.Provider>
    );
  }
}

export default App;
