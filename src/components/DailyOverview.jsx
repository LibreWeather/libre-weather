import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ReactAnimatedWeather from 'react-animated-weather';


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
  const icon = (
    <ReactAnimatedWeather
      icon={condition}
      color="white"
      size={15}
      animate={false}
      />);

  let label = '';

  switch (condition) {
    // TODO Should we support light rain?
    case 'RAIN':
    case 'SNOW':
    case 'SLEET':
      label = hrCnt < 3 ? '' : 'Rain';
    case 'PARTLY_CLOUDY_DAY':
    case 'PARTLY_CLOUDY_NIGHT':
      label = hrCnt < 4 ? '' : 'Partly Cloudy';
    case 'CLOUDY':
    case 'FOG':
      label = hrCnt < 4 ? '' : 'Mostly Cloudy';
    default:
      label = hrCnt < 3 ? '' : 'Clear';
  }

  return (
    <React.Fragment>
      {icon}&nbsp;{label}
    </React.Fragment>
  )
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

  return normalizedData.map(({ hrCnt, condition }, index) =>
    <Col className={`overviewBar hrs${hrCnt} ${getConditionClass(condition)}`} key={`ov${index}`}>
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

  return next24Hours.map((hour, index) => {
    const classes = ['hr', index % 2 == 0 ? 'even' : 'odd'];
    if (index === 0) classes.push('first');
    if (index === 1) classes.push('second');

    return (
      <Col className={"overviewTemps " + classes.join(' ')} key={`hr${index}`}>
        <span className={classes.join(' ')}></span>
        { index === 0
          ? ( <div className="time">Now</div> )
          : index % 2 === 0
            ? ( <div className="time later">{`+${index}`}</div> )
            : ''
        }
        { index === 0
          ? ( <div className="temperature">{hour.temp}</div> )
          : index % 2 === 0
            ? ( <div className="temperature later">{hour.temp}</div> )
            : ''
        }
      </Col>
      );
    });
}

class DailyOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { zip: '67042' };
  }

  render() {
    console.log(this.props.weatherData)
    const weather = dailyWeather(this.props.weatherData);
    return (
      <Container className="dailyOverview">
        <Row className="justify-content-center">
          {getHourColumns(weather.hourly)}
        </Row>
        <Row className="justify-content-center hrs">
          {getTempColumns(weather.hourly)}
        </Row>
      </Container>
    );
  }
}

module.exports = DailyOverview;
