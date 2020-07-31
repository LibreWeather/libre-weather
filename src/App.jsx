import React from 'react';

import CurrentWeather from './components/CurrentWeather';
import DEFAULT_WEATHER_DATA  from './resources/defaultWeatherData.json';

const LAT = '38.910843';
const LON = '-94.382172';
const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;
const UNITS = 'imperial';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.currentWeatherElement = React.createRef();

    this.state = {
      weather: DEFAULT_WEATHER_DATA
    };
  }

  componentDidMount() {
    var headers = { 'x-latitude': LAT, 'x-longitude': LON, 'x-unit': UNITS };
    fetch(LIBRE_WEATHER_API_ROOT, { method: 'GET', headers: headers})
      .then(res => res.json()).then((data) => {
        this.setState({ weather: data });
        this.currentWeatherElement.current.updateWeatherData(data);
      }).catch(console.log);
  }

  render() {
    return (
      <div className="App">
        <header className="header">
          <CurrentWeather ref={this.currentWeatherElement} weatherData={this.state.weather}/>
        </header>
      </div>
    );
  }
}
export default App;
