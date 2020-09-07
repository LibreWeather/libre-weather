import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import getWeatherIcon from './WeatherIcon';

import makeid from '../utilities/index';

const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;

const dailyWeather = (data) => ({
  hourly: [].concat(
    data.hourly.map(({ condition, temp, time }) => ({
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

const getHourColumns = (hourlyWeather) => {
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
    <Col className={`overviewBar hrs${hrCnt} ${getConditionClass(condition)}`} key={`ov-${makeid()}`}>
      <div className="mx-auto">
        &nbsp;
        {getConditionLabel(condition, hrCnt, time)}
      </div>
    </Col>
  ));
};

const getHourFromTimestamp = (timestamp) => {
  return new Date(timestamp * 1000)
    .toLocaleTimeString({}, { hour12: true, hour: 'numeric' })
    .toLowerCase()
    .replace(/ /g, '');
};

const getTempColumns = (hourlyWeather) => {
  const next24Hours = hourlyWeather.slice(0, 24);

  return next24Hours.map((hour, index) => {
    const classes = ['hr', index % 2 === 0 ? 'even' : 'odd'];
    if (index === 0) classes.push('first');
    if (index === 1) classes.push('second');

    return (
      <Col className={`overviewTemps ${classes.join(' ')}`} key={`hr-${makeid()}`}>
        <span className={classes.join(' ')} />
        {index === 0 ? (
          <div className="time">Now</div>
        ) : index % 2 === 0 ? (
          <div className="time later">{getHourFromTimestamp(hour.time)}</div>
        ) : (
          ''
        )}
        {index === 0 ? (
          <div className="temperature">{hour.temp}</div>
        ) : index % 2 === 0 ? (
          <div className="temperature later">{hour.temp}</div>
        ) : (
          ''
        )}
      </Col>
    );
  });
};

class DailyOverview extends React.Component {
  render() {
    const { weatherData: raw } = this.props;
    const weather = dailyWeather(raw);
    return (
      <Container className="dailyOverview">
        <Row className="justify-content-center">{getHourColumns(weather.hourly)}</Row>
        <Row className="justify-content-center hrs">{getTempColumns(weather.hourly)}</Row>
      </Container>
    );
  }
}

module.exports = DailyOverview;
