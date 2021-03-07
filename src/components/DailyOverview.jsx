import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import getWeatherIcon from './WeatherIcon';

import makeid from '../utilities/index';

const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;

const dailyWeather = (data) => ({
  hourly: [].concat(
    data.map(({ condition, temp, time }) => ({
      condition,
      temp: tempDisplay(temp),
      time,
    }))
  ),
});

const getConditionClass = (condition) => {
  switch (condition) {
    // TODO Should we support light rain?
    case 'RAIN':
    case 'SNOW':
    case 'SLEET':
      return 'rain';
    case 'PARTLY_CLOUDY':
      return 'partlyCloudy';
    case 'CLOUDY':
    case 'FOG':
      return 'mostlyCloudy';
    default:
      return 'clear';
  }
};

const getConditionLabel = (condition, hrCnt, time) => {
  let label = '';
  switch (condition) {
    // TODO Should we support light rain?
    case 'RAIN':
      label = hrCnt < 3 ? '' : 'Rain';
      break;
    case 'SNOW':
      label = hrCnt < 3 ? '' : 'Snow';
      break;
    case 'SLEET':
      label = hrCnt < 3 ? '' : 'Sleet';
      break;
    case 'PARTLY_CLOUDY':
      label = hrCnt < 5 ? '' : 'Partly Cloudy';
      break;
    case 'CLOUDY':
      label = hrCnt < 5 ? '' : 'Mostly Cloudy';
      break;
    case 'FOG':
      label = hrCnt < 3 ? '' : 'Foggy';
      break;
    default:
      label = hrCnt < 3 ? '' : 'Clear';
  }

  return (
    <>
      {getWeatherIcon(condition, 15, time)}
      &nbsp;
      {label}
    </>
  );
};

const getFlexStyle = (width) => {
  return {
    "flex": `0 0 ${width}em`, 
    "msFlex": `0 0 ${width}em`,
  };
};

const getOverviewBarCols = (hourlyWeather) => {
  // Normalize hourly data into blocks of contiguous conditions
  let currentHour = { hrCnt: 1, condition: hourlyWeather[0].condition, time: hourlyWeather[0].time };
  const normalizedData = [currentHour];
  hourlyWeather.slice(1, 24).forEach(({ condition, time }) => {
    if (condition === currentHour.condition) {
      currentHour.hrCnt += 1;
    } else {
      currentHour = { hrCnt: 1, condition, time };
      normalizedData.push(currentHour);
    }
  });

  return normalizedData.map(({ hrCnt, condition, time }) => (
    <Col className={`overviewBar ${getConditionClass(condition)}`} style={getFlexStyle(hrCnt * 2)} key={`ovBar-${makeid()}`}>
      <div className="mx-auto">
        &nbsp;
        {getConditionLabel(condition, hrCnt, time)}
      </div>
    </Col>
  ));
};

const getTicCols = () => {
  return Array.from(Array(24).keys()).map((i) => (
    <Col className="overviewTics" key={`ovTic-${makeid()}`}>
      <div className={`${i % 2 == 0 ? 'even' : 'odd'}`}>&nbsp;</div>
    </Col>
  ));
};

const getHourFromTimestamp = (timestamp) => {
  return new Date(timestamp * 1000)
    .toLocaleTimeString({}, { hour12: true, hour: 'numeric' })
    .toLowerCase()
    .replace(/ /g, '');
};

const getOverviewDetailsCols = (hourlyWeather) => {
  const next24Hours = hourlyWeather.slice(0, 24);
  return next24Hours.filter((hour, index) => index % 2 == 0).map((hour, index) => (
    <Col className={`overviewDetails ${index == 0 ? 'first' : ''}`} key={`ovDetails-${makeid()}`}>
      <div className="overviewDetailsTime">{getHourFromTimestamp(hour.time)}</div>
      <div className="overviewDetailsTemp">{hour.temp}</div>
    </Col>
  ));
};

class DailyOverview extends React.Component {
  render() {
    const { hourlyWeatherData: raw } = this.props;
    const weather = dailyWeather(raw);
    return (
      <Container className="dailyOverview">
        <Row className="justify-content-center">{getOverviewBarCols(weather.hourly)}</Row>
        <Row className="justify-content-center">{getTicCols()}</Row>
        <Row className="justify-content-center overviewDetailsRow">{getOverviewDetailsCols(weather.hourly)}</Row>
      </Container>
    );
  }
}

module.exports = DailyOverview;
