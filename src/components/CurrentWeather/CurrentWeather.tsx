import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { WeatherIcon } from '../WeatherIcon';
import { usePreferences } from '../../providers/PreferencesProvider';
import { tempDisplay, windLabel } from '../../utilities/formatters';
import {
  VisibilityUnit,
  type Pressure,
  type Visibility,
  type Weather,
  type WindSpeed,
} from '../../utilities/weatherTypes';

import './CurrentWeather.less';

/** Clearance under the sticky navbar before the hero counts as scrolled away. */
const NAVBAR_CLEARANCE_PX = 72;

const pressureDisplay = (pressure: Pressure) => `${Math.round(Number(pressure.value))} mb`;
const visibilityDisplay = (visibility: Visibility) => {
  const rawVis = [VisibilityUnit.MI, VisibilityUnit.Percent];
  const visDistance = rawVis.includes(visibility.unit) ? Number(visibility.value) : Number(visibility.value) / 1000;
  const rawDistance = [VisibilityUnit.Percent];
  return !rawDistance.includes(visibility.unit) && visDistance >= 10 ?
    `10+ ${visibility.unit.toLowerCase()}` :
    `${Math.round(visDistance)} ${visibility.unit.toLowerCase()}`;
};
const windSpeedDisplay = (windSpeed: WindSpeed) =>
  `${Math.round(Number(windSpeed.magnitude))} ${windLabel(windSpeed.unit)}`;

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

/** Marks `<html>` with `hero-offscreen` while the hero is scrolled up behind the navbar. */
const useHeroOffscreen = (hero: React.RefObject<HTMLElement | null>) => {
  React.useEffect(() => {
    const node = hero.current;
    const root = document.documentElement;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.classList.toggle('hero-offscreen', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: `-${NAVBAR_CLEARANCE_PX}px 0px 0px 0px` }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.classList.remove('hero-offscreen');
    };
  }, [hero]);
};

const CurrentWeather = ({ weatherData }: { weatherData: Weather }) => {
  const { resolved } = usePreferences();
  const hero = React.useRef<HTMLDivElement>(null);
  useHeroOffscreen(hero);
  const currentWeather = currentWeatherData(weatherData);
  const { compact } = resolved;
  const description = currentWeather.description ? `${currentWeather.description}.` : null;

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
      <div className="currentHero" ref={hero}>
        <WeatherIcon condition={currentWeather.conditionIcon} sizePx={compact ? 40 : 70} time={null} animate />
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
