import React from 'react';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { WeatherIcon } from '@components/WeatherIcon';
import { useTrackHero } from '@/hooks/useHero';
import type { Weather } from '@/models/weather';
import { usePreferences } from '@/providers/PreferencesProvider';
import { currentConditions } from '@/utilities/current';

import './CurrentWeather.less';

const CurrentWeather = ({ weatherData }: { weatherData: Weather }) => {
  const { resolved } = usePreferences();
  const hero = React.useRef<HTMLDivElement>(null);
  useTrackHero(hero);
  const currentWeather = currentConditions(weatherData);
  const { compact } = resolved;
  const { description } = currentWeather;

  return (
    <Container className="current" fluid>
      <Row className="currentTopBar h6 justify-content-center">
        <Col xs="auto">
          <span className="wind">
            <b>Wind:</b> {currentWeather.windSpeed}{' '}
          </span>
          <Icon icon={faLongArrowAltDown} rotate={currentWeather.windDeg} />
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
      <div className="currentHero" ref={hero}>
        <WeatherIcon condition={currentWeather.condition} sizePx={compact ? 40 : 70} animate />
        <div className="currentSummary">
          <div className="currentTemp h1 bolder">
            {currentWeather.temp}
            {currentWeather.summary ? ` ${currentWeather.summary}` : ''}
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
            {compact && description ? <span className="currentMeta-description">{description}</span> : null}
          </div>
        </div>
      </div>
      {!compact && description ? (
        <Row className="currentDescription justify-content-center h2">{description}</Row>
      ) : null}
    </Container>
  );
};

export default CurrentWeather;
