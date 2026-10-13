import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { WeatherIcon } from '../WeatherIcon';
import {
  TempUnit,
  VisibilityUnit,
  WindUnit,
  type Pressure,
  type Temperature,
  type Visibility,
  type Weather,
  type WindSpeed,
} from '../../utilities/weatherTypes';

import './CurrentWeather.less';

const pressureDisplay = (pressure: Pressure) => `${Math.round(Number(pressure.value))} mb`;
const tempDisplay = (temp: Temperature) =>
  `${Math.round(Number(temp.value))}${temp.unit === TempUnit.K ? 'K' : '˚'}`;
const visibilityDisplay = (visibility: Visibility) => {
  const rawVis = [VisibilityUnit.MI, VisibilityUnit.Percent];
  const visDistance = rawVis.includes(visibility.unit) ? Number(visibility.value) : Number(visibility.value) / 1000;
  const rawDistance = [VisibilityUnit.Percent];
  return !rawDistance.includes(visibility.unit) && visDistance >= 10 ?
    `10+ ${visibility.unit.toLowerCase()}` :
    `${Math.round(visDistance)} ${visibility.unit.toLowerCase()}`;
};
const windSpeedDisplay = (windSpeed: WindSpeed) =>
  `${Math.round(Number(windSpeed.magnitude))} ${windSpeed.unit === WindUnit.MPH ? 'mph' : 'm/s'}`;

const currentWeatherData = (data: Weather) => ({
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
  uvIndex: Math.round(Number(data.current.uvIndex)),
  visibility: visibilityDisplay(data.current.visibility),
  windDeg: data.current.windspeed.direction,
  windSpeed: windSpeedDisplay(data.current.windspeed),
});

export default class CurrentWeather extends React.Component<{ weatherData: Weather }> {
  render() {
    const { weatherData } = this.props;
    const currentWeather = currentWeatherData(weatherData);
    const description = currentWeather.description ? (
      <Row className="justify-content-center h2">{currentWeather.description}.</Row>
    ) : null;

    return (
      <Container className="current" fluid>
        <Row className="currentTopBar h6 justify-content-center">
          <Col xs="auto">
            <span className="wind">
              <b>Wind:</b> {currentWeather.windSpeed}{' '}
            </span>
            <FontAwesomeIcon icon={faLongArrowAltDown} transform={{ rotate: Number(currentWeather.windDeg) }} />
          </Col>
          <Col xs="auto">
            <b>Humidity:</b> {currentWeather.humidity}%
          </Col>
          <Col xs="auto">
            <b>Dew Pt:</b> {currentWeather.dewPoint}
          </Col>
          {currentWeather.uvIndex ? (
            <Col xs="auto">
              <b>UV Index:</b> {currentWeather.uvIndex}
            </Col>
          ) : null}
          <Col xs="auto">
            <b>Visibility:</b> {currentWeather.visibility}
          </Col>
          <Col xs="auto">
            <b>Pressure:</b> {currentWeather.pressure}
          </Col>
        </Row>
        <div className="currentHero">
          <WeatherIcon condition={currentWeather.conditionIcon} sizePx={70} time={null} animate />
          <div className="currentSummary">
            <div className="currentTemp h1 bolder">
              {currentWeather.temp}
              {currentWeather.summary?.length ? ` ${currentWeather.summary}.` : ''}
            </div>
            <div className="currentMeta h6">
              <span>
                <b>Feels Like:</b> {currentWeather.tempFeelsLike}
              </span>
              <span>
                <b>Low:</b> {currentWeather.tempMin}
              </span>
              <span>
                <b>High:</b> {currentWeather.tempMax}
              </span>
            </div>
          </div>
        </div>
        {description}
      </Container>
    );
  }
}
