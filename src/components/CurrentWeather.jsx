import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

const pressureDisplay = (pressure) => `${Math.round(pressure.value)} mb`;
const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;
const visibilityDisplay = (visibility) => `${Math.round(visibility.value)} ${visibility.unit === 'MI' ? 'mi' : 'm'}`;
const windSpeedDisplay = (windSpeed) => `${Math.round(windSpeed.magnitude)} ${windSpeed.unit === 'MPH' ? 'mph' : 'm/s'}`;

const currentWeatherData = (data) => ({
  conditionIcon: data.current.icon,
  description: data.current.description,
  dewPoint: tempDisplay(data.current.dewPoint),
  humidity: data.current.humidity,
  pressure: pressureDisplay(data.current.pressure),
  summary: data.current.summary,
  temp: tempDisplay(data.current.temp),
  tempFeelsLike: tempDisplay(data.current.apparentTemp),
  tempMax: tempDisplay(data.daily[0].temp.max),
  tempMin: tempDisplay(data.daily[0].temp.min),
  uvIndex: Math.round(data.current.uvIndex),
  visibility: visibilityDisplay(data.current.visibility),
  windDeg: data.current.windspeed.direction,
  windSpeed: windSpeedDisplay(data.current.windspeed)
});

class CurrentWeather extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      iconSizePx: 70,
      weather: currentWeatherData(props.weatherData)
    };
  }

  updateWeatherData = (data) => {
    this.setState({ weather: currentWeatherData(data) });
  }

  render() {
    return (
      <Container className="current" fluid>
        <Row className="currentTopBar h6 justify-content-center">
          <Col md="auto"><b>Wind:</b> {this.state.weather.windSpeed}  <FontAwesomeIcon icon={faLongArrowAltDown} transform={{ rotate: this.state.weather.windDeg }}/></Col>
          <Col md="auto"><b>Humidity:</b> {this.state.weather.humidity}%</Col>
          <Col md="auto"><b>Dew Pt:</b> {this.state.weather.dewPoint}</Col>
          <Col md="auto"><b>UV Index:</b> {this.state.weather.uvIndex}</Col>
          <Col md="auto"><b>Visibility:</b> {this.state.weather.visibility}</Col>
          <Col md="auto"><b>Pressure:</b> {this.state.weather.pressure}</Col>
        </Row>
        <Row className="h1 justify-content-center">
          <Col md="auto"><ReactAnimatedWeather icon={this.state.weather.conditionIcon} color='white' size={this.state.iconSizePx}/></Col>
          <Col md="auto">
            <Row>{this.state.weather.temp} {this.state.weather.summary}</Row>
            <Row className="h6 currentBottomBar">
              <Col md="auto" className="currentFeelsLike"><b>Feels Like:</b> {this.state.weather.tempFeelsLike}</Col>
              <Col md="auto"><b>Low:</b> {this.state.weather.tempMin}</Col>
              <Col md="auto"><b>High:</b> {this.state.weather.tempMax}</Col>
            </Row>
          </Col>           
        </Row>
        <Row  className="justify-content-center h2">{this.state.weather.description}</Row>
      </Container>
    );
  }
}

module.exports = CurrentWeather;