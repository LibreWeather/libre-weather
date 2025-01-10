import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { WeatherIcon } from '../WeatherIcon';

import './DailyOverview.less';

import makeid, { getHourFromTimestamp } from '../../utilities';

const tempDisplay = (temp) => `${Math.round(temp.value)}${temp.unit === 'K' ? 'K' : '˚'}`;

const dailyWeather = (data) => ({
  hourly: [].concat(
    data?.filter(Boolean).map(({ condition, temp, time }) => ({
      condition,
      temp: tempDisplay(temp),
      time,
    }))
  ),
});

const getConditionClass = (condition) => {
  switch (condition) {
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

const ConditionLabel = ({ condition, hrCnt, time }) => {
  const [variant, setVariant] = useState(window.innerWidth < 400 ? 'mobile' : undefined);
  useEffect(() => {
    setVariant(window.innerWidth < 400 ? 'mobile' : undefined);
  }, []);

  let label;
  if (variant === 'mobile' && hrCnt < 10) {
    label = '';
  } else {
    switch (condition) {
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
  }

  return (
    <>
      <WeatherIcon condition={condition} sizePx={15} time={time} />
      &nbsp;
      {label}
    </>
  );
};

const OverviewBarCols = ({ hourlyWeather }) => {
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
    <Col className={`overviewBar ${getConditionClass(condition)} ov-col-${hrCnt * 2}`} key={`ovBar-${makeid()}`}>
      <div className="mx-auto v-center">
        &nbsp;
        <ConditionLabel condition={condition} hrCnt={hrCnt} time={time} />
      </div>
    </Col>
  ));
};

const OverviewDetailsColumns = ({ hourlyWeather }) => {
  const next24Hours = hourlyWeather.slice(0, 24);
  return next24Hours
    .filter((hour, index) => index % 2 === 0)
    .map((hour, index) => (
      <Col className={`overviewDetails ${index === 0 ? 'first' : ''}`} key={`ovDetails-${makeid()}`}>
        <div className="overviewDetailsTime">{getHourFromTimestamp(hour.time)}</div>
        <div className="overviewDetailsTemp">{hour.temp}</div>
      </Col>
    ));
};

export default class DailyOverview extends React.Component {
  #ticCols = Array.from(Array(24).keys()).map((i) => (
    <Col className="overviewTics" key={`ovTic-${makeid()}`}>
      <div className={`${i % 2 === 0 ? 'even' : 'odd'}`}>&nbsp;</div>
    </Col>
  ));

  render() {
    const { hourlyWeatherData: raw } = this.props;
    const weather = dailyWeather(raw);
    return (
      <Container className="dailyOverview">
        <Row className="justify-content-center">
          <OverviewBarCols hourlyWeather={weather.hourly} />
        </Row>
        <Row className="justify-content-center">{this.#ticCols}</Row>
        <Row className="justify-content-center overviewDetailsRow">
          <OverviewDetailsColumns hourlyWeather={weather.hourly} />
        </Row>
      </Container>
    );
  }
}
