import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import getWeatherIcon from './WeatherIcon';
import makeid from '../utilities/index';

const weeklyWeatherData = (data) => {
  const { daily } = data;
  return daily.slice(0, 7).map(({ condition, temp, time }) => {
    const { max, min } = temp;
    return {
      condition,
      minTemp: min,
      maxTemp: max,
      time,
    };
  });
};

const getDayOfTheWeek = (time) => {
  switch (new Date(time * 1000).getDay()) {
    case 0:
      return 'Sun';
    case 1:
      return 'Mon';
    case 2:
      return 'Tue';
    case 3:
      return 'Wed';
    case 4:
      return 'Thu';
    case 5:
      return 'Fri';
    default:
      return 'Sat';
  }
}

const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;

const getOverallMinTemp = (weeklyWeather) => 
  Math.min(...weeklyWeather.map((dailyWeather) => dailyWeather.minTemp.value));

const getOverallMaxTemp = (weeklyWeather) => 
  Math.max(...weeklyWeather.map((dailyWeather) => dailyWeather.maxTemp.value));

const getTempPositionValue = (dayTempVal, totalMin, totalMax) => 
  ((dayTempVal - totalMin)/(totalMax - totalMin)) * 35 + 2;

const getTempRangeCol = (dailyWeather, overallMinTemp, overallMaxTemp) => {
  const { minTemp, maxTemp } = dailyWeather;
  const minTempPosition = getTempPositionValue(minTemp.value, overallMinTemp, overallMaxTemp);
  const maxTempPosition = getTempPositionValue(maxTemp.value, overallMinTemp, overallMaxTemp);
  const minColStyle = { 
    "flex": `0 0 ${minTempPosition}em`, 
    "-ms-flex": `0 0 ${minTempPosition}em`,
  };
  const maxColStyle = { 
    "flex": `0 0 ${37 - maxTempPosition}em`, 
    "-ms-flex": `0 0 ${37 - maxTempPosition}em`,
  };
  return (
    <Container>
      <Row>
        <Col className="minCol" style={minColStyle}>{tempDisplay(minTemp)}</Col>
        <Col className="barCol"></Col>
        <Col className="maxCol" style={maxColStyle}>{tempDisplay(maxTemp)}</Col>
      </Row>
    </Container>
  );
};

const getDailyRows = (weeklyWeather) => {
  const conditionDate = new Date();
  conditionDate.setHours(12);
  const conditionTime = conditionDate.getTime()/1000;

  const overallMin = getOverallMinTemp(weeklyWeather);
  const overallMax = getOverallMaxTemp(weeklyWeather);

  return weeklyWeather.map((dailyWeather, index) => {
    return (
      <Row className="justify-content-center weeklyForecastRow" key={`ww-${makeid()}`}>
        <Container>
          <Row>
            <Col className="iconCol">
              {getWeatherIcon(dailyWeather.condition, 20, conditionTime)}
            </Col>
            <Col className="forcastDayCol">
              {index == 0 ? 'Today' : getDayOfTheWeek(dailyWeather.time)}
            </Col>
            <Col className="tempRangeCol">
              {getTempRangeCol(dailyWeather, overallMin, overallMax)}
            </Col>
            <Col className="toggleCol">
              <FontAwesomeIcon icon={faPlusCircle} />
            </Col>
          </Row>
        </Container>
      </Row>
    );
  });
};

class WeeklyForecast extends React.Component {
  render() {
    const { weatherData } = this.props;
    const weeklyWeather = weeklyWeatherData(weatherData);
    return (
      <Container className="weeklyForecast" fluid>
        {getDailyRows(weeklyWeather)}
      </Container>
    );
  }
}

module.exports = WeeklyForecast;
