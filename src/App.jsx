/* globals localStorage */

import React from 'react';
import fetch from 'node-fetch';

import NavLink, { BrowserRouter, Route, Switch } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faOsi } from '@fortawesome/free-brands-svg-icons';

import DEFAULT_WEATHER_DATA from './resources/defaultWeatherData.json';
import CurrentDayContext from './utilities/CurrentDayContext';

import NavigationBar from './components/NavigationBar';
import CurrentWeather from './components/CurrentWeather';
import DailyOverview from './components/DailyOverview';
import WeeklyForecast from './components/WeeklyForecast';

import LicensesView from './views/LicensesView';

const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;
const DEFAULT_UNITS = 'IMPERIAL';
const DEFAULT_LAT = 37.8180061;
const DEFAULT_LON = -96.8480188;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: DEFAULT_WEATHER_DATA,
      units: localStorage.getItem('units') || DEFAULT_UNITS,
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
    };

    this.setUnits = this.setUnits.bind(this);
    this.setLatLon = this.setLatLon.bind(this);
    this.setWeather = this.setWeather.bind(this);
  }

  componentDidMount() {
    const { units } = this.state;
    this.setUnits(units);
  }

  setWeather(lat, lon, units) {
    fetch(`${LIBRE_WEATHER_API_ROOT}/${lat},${lon}/unit/${units}`)
      .then((res) => res.json())
      .then((weather) => this.setState({ weather }))
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  setUnits(units) {
    this.setState({ units });
    localStorage.setItem('units', units);
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
        <div className="App hide-scroll">
          <NavigationBar setLatLon={this.setLatLon} setUnits={this.setUnits} />
          <BrowserRouter>
            <Switch>
              <Route exact path="/">
                <header className="header constrained hide-scroll">
                  <CurrentWeather weatherData={weather} />
                  <DailyOverview hourlyWeatherData={weather.hourly} />
                  <WeeklyForecast weatherData={weather} />
                </header>
              </Route>
              <Route path="/licenses">
                <LicensesView />
              </Route>
            </Switch>
          </BrowserRouter>
        </div>
        <Navbar fixed="bottom">
          <Nav.Link href="/licenses">
            <FontAwesomeIcon icon={faOsi} />
          </Nav.Link>
          <Nav.Link href="https://github.com/LibreWeather/libre-weather" target="_blank">
            <FontAwesomeIcon icon={faGithub} />
          </Nav.Link>
        </Navbar>
      </CurrentDayContext.Provider>
    );
  }
}

export default App;
