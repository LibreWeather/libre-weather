import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import getWeatherIcon from './WeatherIcon';

const pressureDisplay = (pressure) => `${Math.round(pressure.value)} mb`;
const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;
const visibilityDisplay = (visibility) => {
  const rawVis = ['MI', '%'];
  const visDistance = rawVis.includes(visibility.unit) ? visibility.value : visibility.value / 1000;
  const rawDistance = ['%'];
  return !rawDistance.includes(visibility.unit) && visDistance >= 10
    ? `10+ ${visibility.unit.toLowerCase()}`
    : `${Math.round(visDistance)} ${visibility.unit.toLowerCase()}`;
};
const windSpeedDisplay = (windSpeed) =>
  `${Math.round(windSpeed.magnitude)} ${windSpeed.unit === 'MPH' ? 'mph' : 'm/s'}`;

const currentWeatherData = (data) => ({
  conditionIcon: data.current.condition,
  description: data.current.description,
  dewPoint: tempDisplay(data.current.dewPoint),
  humidity: Math.round(data.current.humidity),
  pressure: pressureDisplay(data.current.pressure),
  summary: data.current.summary,
  temp: tempDisplay(data.current.temp),
  tempFeelsLike: tempDisplay(data.current.apparentTemp),
  tempMax: tempDisplay(data.daily[0].temp.max),
  tempMin: tempDisplay(data.daily[0].temp.min),
  uvIndex: Math.round(data.current.uvIndex),
  visibility: visibilityDisplay(data.current.visibility),
  windDeg: data.current.windspeed.direction,
  windSpeed: windSpeedDisplay(data.current.windspeed),
});

class CurrentWeather extends React.Component {
  render() {
    const { weatherData } = this.props;
    const currentWeather = currentWeatherData(weatherData);
    const tempSummary = currentWeather.summary?.length ? (
      <Row className="h1 bolder">
        {currentWeather.temp} {currentWeather.summary}.
      </Row>
    ) : (
      <Row className="h1 bolder">{currentWeather.temp}</Row>
    );
    const description = currentWeather.description ? (
      <Row className="justify-content-center h2">{currentWeather.description}.</Row>
    ) : null;
    return (
      <Container className="current" fluid>
        <Row className="currentTopBar h6 justify-content-center">
          <Col md="auto">
            <b>Wind:</b> {currentWeather.windSpeed}{' '}
            <FontAwesomeIcon icon={faLongArrowAltDown} transform={{ rotate: currentWeather.windDeg }} />
          </Col>
          <Col md="auto">
            <b>Humidity:</b> {currentWeather.humidity}%
          </Col>
          <Col md="auto">
            <b>Dew Pt:</b> {currentWeather.dewPoint}
          </Col>
          {currentWeather.uvIndex ? (
            <Col md="auto">
              <b>UV Index:</b> {currentWeather.uvIndex}
            </Col>
          ) : null}
          <Col md="auto">
            <b>Visibility:</b> {currentWeather.visibility}
          </Col>
          <Col md="auto">
            <b>Pressure:</b> {currentWeather.pressure}
          </Col>
        </Row>
        <Row className="h1 justify-content-center">
          <Col md="auto">{getWeatherIcon(currentWeather.conditionIcon, 70, null, true)}</Col>
          <Col md="auto">
            {tempSummary}
            <Row className="h6 currentBottomBar">
              <Col md="auto" className="currentFeelsLike">
                <b>Feels Like:</b> {currentWeather.tempFeelsLike}
              </Col>
              <Col md="auto">
                <b>Low:</b> {currentWeather.tempMin}
              </Col>
              <Col md="auto">
                <b>High:</b> {currentWeather.tempMax}
              </Col>
            </Row>
          </Col>
        </Row>
        {description}
      </Container>
    );
  }
}

module.exports = CurrentWeather;
