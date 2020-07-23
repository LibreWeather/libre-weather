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

const capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
}

class WeatherData {
  constructor(type = 'NA', 
    data = {
      current : {
        conditionIcon: 'CLOUDY',
        description: '',
        descriptionShort: '',
        dewPoint: 999,
        humidity: 99,
        temp: 999,
        tempFeelsLike: 999,
        uvIndex: 99,
        windDeg: 0,
        windSpeed: 999
      },
      daily: [{
        maxTemp: 999,
        minTemp: 999
      }]
    }) {    
    switch (type) {
      case 'NA':
        this.current = data.current;
        this.daily = data.daily;
        break;
      case 'OWM':
        this.current = {
          conditionIcon: getWeatherIconOWM(data.current.weather[0].id),
          description: capitalize(data.current.weather[0].description),
          descriptionShort: data.current.weather[0].main,
          dewPoint: data.current.dew_point,
          humidity: data.current.humidity,
          tempFeelsLike: Math.round(data.current.feels_like),
          temp: Math.round(data.current.temp),
          uvIndex: Math.round(data.current.uvi),
          windDeg: data.current.wind_deg,
          windSpeed: Math.round(data.current.wind_speed)
        };
        this.daily = [{
          maxTemp: Math.round(data.daily[0].temp.max),
          minTemp: Math.round(data.daily[0].temp.min)
        }];
        break;
      default:
        break;
    }
  }
}

class CurrentWeather extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weather: new WeatherData(),
      iconSizePx: 50
    };
    this.render = this.render.bind(this);
  }

  componentDidMount() {
    fetch(`${OPEN_WEATHER_ROOT}?lat=${LAT}&lon=${LON}&appid=${APP_ID}&units=${UNITS}`)
      .then(res => res.json()).then((data) => this.setState({ weather: new WeatherData('OWM', data) }))
      .catch(console.log);
  }

  render() {
    return (
      <Container fluid>
        <Row className="h6">
          <Col><b>Wind:</b> {this.state.weather.current.windSpeed}mph  <FontAwesomeIcon icon={faLongArrowAltDown} transform={{ rotate: this.state.weather.current.windDeg }}/></Col>
          <Col><b>Humidity:</b> {this.state.weather.current.humidity}%</Col>
          <Col><b>Dew Pt:</b> {this.state.weather.current.dewPoint}˚</Col>
          <Col><b>UV Index:</b> {this.state.weather.current.uvIndex}</Col>
        </Row>
        <Row className="justify-content-center h1">
          <ReactAnimatedWeather icon={this.state.weather.current.conditionIcon} color='white' size={this.state.iconSizePx}/> {this.state.weather.current.temp}˚ {this.state.weather.current.descriptionShort}
        </Row>
        <Row className="justify-content-center h5">
          <b>Feels Like:</b> {this.state.weather.current.tempFeelsLike}˚ <b>Low:</b> {this.state.weather.daily[0].minTemp}˚ <b>High:</b> {this.state.weather.daily[0].maxTemp}˚
        </Row>
        <Row  className="justify-content-center h2">
          {this.state.weather.current.description}
        </Row>
      </Container>
    );
  }
}

module.exports = CurrentWeather;