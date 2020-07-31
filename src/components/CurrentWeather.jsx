import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

const OPEN_WEATHER_ROOT = 'https://api.openweathermap.org/data/2.5/onecall';
const LAT = '38.910843';
const LON = '-94.382172';
const LIBRE_WEATHER_API_ROOT = process.env.LIBRE_WEATHER_API;
const APP_ID = process.env.OWM_KEY;
const UNITS = 'imperial';

const getWeatherIconOWM = (conditionCode) => {
  if (200 <= conditionCode && 600 > conditionCode) {
    console.log(conditionCode)
    return 'RAIN'
  } else if (600 <= conditionCode && 611 > conditionCode) {
    return 'SNOW';
  } else if (611 <= conditionCode && 700 > conditionCode) {
    return 'SLEET';
  } else if (701 <= conditionCode && 771 > conditionCode) {
    return 'FOG';
  } else if (771 <= conditionCode && 800 > conditionCode) {
    return 'WIND';
  } else if (800 === conditionCode) {
    // CLEAR_NIGHT
    return 'CLEAR_DAY';
  } else if (801 <= conditionCode && 803 > conditionCode) {
    // PARTLY_CLOUDY_NIGHT
    return 'PARTLY_CLOUDY_DAY';
  } else if (803 <= conditionCode && 900 > conditionCode) {
    return 'CLOUDY';
  }
  return 'CLOUDY';
};

const DEFAULT_WEATHER_DATA = {
  current : {
    conditionIcon: 'CLOUDY',
    description: '',
    descriptionShort: '',
    dewPoint: 999,
    humidity: 99,
    pressure: 9999,
    temp: 999,
    tempFeelsLike: 999,
    uvIndex: 99,
    visibility: 0,
    windDeg: 0,
    windSpeed: 999
  },
  daily: [{
    maxTemp: 999,
    minTemp: 999
  }]
}

class WeatherData {
  constructor(data = null) {    
    if (data) {
      this.current = {
        conditionIcon: getWeatherIconOWM(data.current.condition),
        description: data.current.description,
        descriptionShort: data.current.descriptionShort,
        dewPoint: Math.round(data.current.dewPoint.value),
        humidity: data.current.humidity,
        pressure: data.current.pressure.value,
        tempFeelsLike: Math.round(data.current.feelsLike.value),
        temp: Math.round(data.current.temp.value),
        uvIndex: Math.round(data.current.uvIndex),
        visibility: Math.round(data.current.visibility.value),
        windDeg: data.current.windspeed.direction,
        windSpeed: Math.round(data.current.windspeed.magnitude)
      };
      this.daily = [{
        maxTemp: Math.round(data.daily[0].max.value),
        minTemp: Math.round(data.daily[0].min.value)
      }];
    } else {
      this.current = DEFAULT_WEATHER_DATA.current;
      this.daily = DEFAULT_WEATHER_DATA.daily;
    }
  }
}

class CurrentWeather extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: new WeatherData(),
      iconSizePx: 70
    };
    this.render = this.render.bind(this);
  }

  componentDidMount() {
    var headers = {
      'x-latitude': LAT,
      'x-longitude': LON,
      'x-unit': UNITS
    }
    fetch(LIBRE_WEATHER_API_ROOT, { method: 'GET', headers: headers})
      .then(res => res.json()).then((data) => this.setState({ weather: new WeatherData(data) }))
      .catch(console.log);
  }

  render() {
    return (
      <Container className="current" fluid>
        <Row className="currentTopBar h6 justify-content-center">
          <Col md="auto"><b>Wind:</b> {this.state.weather.current.windSpeed}mph  <FontAwesomeIcon icon={faLongArrowAltDown} transform={{ rotate: this.state.weather.current.windDeg }}/></Col>
          <Col md="auto"><b>Humidity:</b> {this.state.weather.current.humidity}%</Col>
          <Col md="auto"><b>Dew Pt:</b> {this.state.weather.current.dewPoint}˚</Col>
          <Col md="auto"><b>UV Index:</b> {this.state.weather.current.uvIndex}</Col>
          <Col md="auto"><b>Visibility:</b> {this.state.weather.current.visibility} mi</Col>
          <Col md="auto"><b>Pressure:</b> {this.state.weather.current.pressure} hPa</Col>
        </Row>
        <Row className="h1 justify-content-center">
          <Col md="auto"><ReactAnimatedWeather icon={this.state.weather.current.conditionIcon} color='white' size={this.state.iconSizePx}/></Col>
          <Col md="auto">
            <Row>{this.state.weather.current.temp}˚ {this.state.weather.current.descriptionShort}</Row>
            <Row className="h6 currentBottomBar">
              <Col md="auto" className="currentFeelsLike"><b>Feels Like:</b> {this.state.weather.current.tempFeelsLike}˚</Col>
              <Col md="auto"><b>Low:</b> {this.state.weather.daily[0].minTemp}˚</Col>
              <Col md="auto"><b>High:</b> {this.state.weather.daily[0].maxTemp}˚</Col>
            </Row>
          </Col>           
        </Row>
        <Row  className="justify-content-center h2">
          {this.state.weather.current.description}
        </Row>
      </Container>
    );
  }
}

module.exports = CurrentWeather;