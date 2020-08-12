import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;

const dailyWeather = (data) => ({  
  hourly: [].concat(data.hourly.map(({ temp, condition }) => ({
    temp: tempDisplay(temp),
    condition
  }))),
});

const getConditionClass = (condition) => {
  switch (condition) {
    // TODO Should we support light rain?
    case 'RAIN':
    case 'SNOW':
    case 'SLEET':
      return 'rain';
    case 'PARTLY_CLOUDY_DAY':
    case 'PARTLY_CLOUDY_NIGHT':
      return 'partlyCloudy';
    case 'CLOUDY':
    case 'FOG':
      return 'mostlyCloudy';
    default:
      return 'clear';
  }
};

const getConditionLabel = (condition, hrCnt) => {
  switch (condition) {
    // TODO Should we support light rain?
    case 'RAIN':
    case 'SNOW':
    case 'SLEET':
      return hrCnt < 3 ? '' : 'Rain';
    case 'PARTLY_CLOUDY_DAY':
    case 'PARTLY_CLOUDY_NIGHT':
      return  hrCnt < 4 ? '' : 'Partly Cloudy';
    case 'CLOUDY':
    case 'FOG':
      return  hrCnt < 4 ? '' : 'Mostly Cloudy';
    default:
      return  hrCnt < 3 ? '' : 'Clear';
  }
};

const getHourColumns = (hourlyWeather) => {
  // Normalize hourly data into blocks of contiguous conditions
  let currentHour = { hrCnt : 1, condition : hourlyWeather[0].condition };
  const normalizedData = [currentHour];
  hourlyWeather.slice(1, 24).forEach(({ condition }) => {
    if (condition === currentHour.condition) {
      currentHour.hrCnt++;
    } else {
      currentHour = { hrCnt : 1, condition };
      normalizedData.push(currentHour);
    }
  });

  let id = 1;
  return normalizedData.map(({ hrCnt, condition }) =>
    <Col className={`overviewBar hrs${hrCnt} ${getConditionClass(condition)}`} key={id++}>
      <div className="mx-auto">&nbsp;{getConditionLabel(condition, hrCnt)}</div>
    </Col>
  );
};

const getTempColumns = (hourlyWeather) => {
  const next24Hours = hourlyWeather.slice(0, 24);
  // const everyOtherHour = [];
  // for (let i = 0; i < hourlyWeather.length; i=i+2) {
  //   everyOtherHour.push(hourlyWeather[i]);
  // }

  return next24Hours.map((hour) => <Col className='overviewTemps hrs1'>ˈ</Col>);
}

class DailyOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {zip: '67042'};
  }

  render() {
    console.log(this.props.weatherData)
    const weather = dailyWeather(this.props.weatherData);
    return (
      <Container className="dailyOverview">
        <Row className="justify-content-center">
          {getHourColumns(weather.hourly)}
        </Row>
        <Row className="justify-content-center">
          {getTempColumns(weather.hourly)}
        </Row>
      </Container>
    );
  }
}

module.exports = DailyOverview;