import React from 'react';

import CurrentWeather from './components/CurrentWeather';
import DailyOverview from './components/DailyOverview';
import LocationSearch from './components/LocationSearch';
import DEFAULT_WEATHER_DATA from './resources/defaultWeatherData.json';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: DEFAULT_WEATHER_DATA,
      units: 'IMPERIAL',
    };
  }

  updateWeather = (lat, lon) => {
    var headers = { 'x-latitude': lat, 'x-longitude': lon, 'x-unit': this.state.units };
    fetch(LIBRE_WEATHER_API_ROOT, { method: 'GET', headers: headers })
      .then((res) => res.json())
      .then((data) => {
        // data.hourly[0].condition = 'RAIN';
        // data.hourly[1].condition = 'RAIN';
        // data.hourly[2].condition = 'RAIN';

        // data.hourly[7].condition = 'CLEAR';
        // data.hourly[8].condition = 'CLEAR';
        // data.hourly[9].condition = 'CLEAR';
        // data.hourly[10].condition = 'CLEAR';

        this.setState({
          weather: data,
        });
      })
      .catch(console.error);
  };

  render() {
    return (
      <div className="App">
        <header className="header">
          <LocationSearch updateWeather={this.updateWeather} />
          <CurrentWeather weatherData={this.state.weather} />
          <DailyOverview weatherData={this.state.weather} />
        </header>
      </div>
    );
  }
}

export default App;
