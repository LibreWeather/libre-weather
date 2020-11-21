import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle, faLongArrowAltRight, faSun, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import getWeatherIcon from './WeatherIcon';
import makeid from '../utilities/index';

const timeDisplay = (time) => {
  const date = new Date(time * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours % 12}:${minutes < 10 ? '0' : ''}${minutes}${hours < 12 ? 'am' : 'pm'}`;
};

const volumeDisplay = (volume) => `${volume.value} ${volume.unit === 'IN' ? 'in' : 'mm'}`;

const precipitationData = (rainVolume, snowVolume) => {
  if (rainVolume.value == null && snowVolume.value == null) {
    rainVolume.value = 0;
  } else if (snowVolume.value != null && (rainVolume.value == null || snowVolume.value > rainVolume.value)) {
    return { type: 'Snow', value: volumeDisplay(snowVolume) };
  }
  return { type: 'Rain', value: volumeDisplay(rainVolume) };
};

const weeklyWeatherData = (data) => {
  const { daily } = data;
  return daily.slice(0, 7).map(({ condition, description, rainVolume, snowVolume, sunrise, sunset, temp, time }) => {
    const { max, min } = temp;
    return {
      condition,
      description,
      minTemp: min,
      maxTemp: max,
      precipitation: precipitationData(rainVolume, snowVolume),
      sunrise: timeDisplay(sunrise),
      sunset: timeDisplay(sunset),
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

class DailyRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      drawerDisplay: 'none',
      drawerIcon: faPlusCircle,
     };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  handleRowClick() {
    const { drawerDisplay } = this.state;
    if ('none' === drawerDisplay) {
      this.setState({ 
        drawerDisplay: 'block',
        drawerIcon: faMinusCircle,
      });
    } else  {
      this.setState({ 
        drawerDisplay: 'none',
        drawerIcon: faPlusCircle,
      });
    }    
  }

  render() {
    const { dailyWeather, index, overallMinTemp, overallMaxTemp } = this.props;
    const { drawerDisplay, drawerIcon } = this.state;

    const conditionDate = new Date();
    conditionDate.setHours(12);
    const conditionTime = conditionDate.getTime()/1000;
    const {precipitation} = dailyWeather;
    
    // TODO The first row in the container is the "button". The next row(s) are toggled
    // TODO the tempature range details need to be updated to include the times (calculated by looking at the hourly data)
    return (
      <Row className="justify-content-center weeklyForecastRow" >
        <Container>
          <Row className="i buttonRow" onClick={this.handleRowClick}>
            <Col className="iconCol">
              {getWeatherIcon(dailyWeather.condition, 20, conditionTime)}
            </Col>
            <Col className="forcastDayCol">
              {index == 0 ? 'Today' : getDayOfTheWeek(dailyWeather.time)}
            </Col>
            <Col className="tempRangeCol">
              {getTempRangeCol(dailyWeather, overallMinTemp, overallMaxTemp)}
            </Col>
            <Col className="toggleCol">
              <FontAwesomeIcon icon={drawerIcon} />
            </Col>
          </Row>
          <Row className="justify-content-center" style={{ "display": drawerDisplay }}>
            <Container>
              <Row className="justify-content-center h3">{dailyWeather.description}</Row>
              <Row>
                <Col>{tempDisplay(dailyWeather.minTemp)} <FontAwesomeIcon icon={faLongArrowAltRight} /> {tempDisplay(dailyWeather.maxTemp)}</Col>
                <Col>
                  <FontAwesomeIcon icon={faSun} /> {dailyWeather.sunrise}<FontAwesomeIcon icon={faLongArrowAltUp} /> - {dailyWeather.sunset}<FontAwesomeIcon icon={faLongArrowAltDown} />
                </Col>
                <Col><span className="font-weight-bold">{precipitation.type}</span> {precipitation.value}</Col>
              </Row>
            </Container>
          </Row>
        </Container>
      </Row>
    );
  }
}

const getDailyRows = (weeklyWeather) => {
  const overallMin = getOverallMinTemp(weeklyWeather);
  const overallMax = getOverallMaxTemp(weeklyWeather);

  return weeklyWeather.map((dailyWeather, index) => {
    return (
      <DailyRow dailyWeather={dailyWeather} index={index} overallMinTemp={overallMin} overallMaxTemp={overallMax} key={`ww-${makeid()}`}/>
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
