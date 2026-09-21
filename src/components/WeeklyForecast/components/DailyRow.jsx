import React from 'react';
import {
  faLongArrowAltDown,
  faLongArrowAltRight,
  faLongArrowAltUp,
  faMinusCircle,
  faPlusCircle,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { WeatherIcon } from '@components/WeatherIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { tempDisplay, getDayOfTheWeek } from '@/utilities';
import HourlyGraph from '@components/HourlyGraph/HourlyGraph';
import { TempRangeCol } from './TempRangeCol';

export class DailyRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerDisplay: 'none',
      drawerIcon: faPlusCircle,
      open: false,
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  handleRowClick() {
    const { drawerDisplay } = this.state;
    if (drawerDisplay === 'none') {
      this.setState({
        drawerDisplay: 'block',
        drawerIcon: faMinusCircle,
        open: true,
      });
    } else {
      this.setState({
        drawerDisplay: 'none',
        drawerIcon: faPlusCircle,
        open: false,
      });
    }
  }

  render() {
    const { dailyWeather, hourly, index, overallMinTemp, overallMaxTemp } = this.props;
    const { drawerDisplay, drawerIcon, open } = this.state;

    const conditionDate = new Date();
    conditionDate.setHours(12);
    const conditionTime = conditionDate.getTime();
    const { precipitation } = dailyWeather;

    // TODO the temperature range details need to be updated to include the times (calculated by looking at the hourly data)
    return (
      <Row
        className={`justify-content-center weeklyForecastRow ${open ? 'open' : ''} ${index > 0 ? 'open-margin' : ''}`}>
        <Container>
          <Row className="buttonRow align-items-center g-2 flex-nowrap" onClick={this.handleRowClick}>
            <Col xs="auto" className="iconCol">
              <WeatherIcon condition={dailyWeather.condition} sizePx={20} time={conditionTime} />
            </Col>
            <Col xs="auto" className="forecastDayCol">
              {index === 0 ? 'Today' : getDayOfTheWeek(dailyWeather.time)}
            </Col>
            <Col className="tempRangeCol min-w-0">
              <TempRangeCol
                dailyWeather={dailyWeather}
                overallMinTemp={overallMinTemp}
                overallMaxTemp={overallMaxTemp} />
            </Col>
            <Col xs="auto" className="toggleCol">
              <FontAwesomeIcon icon={drawerIcon} />
            </Col>
          </Row>
          <Row
            className="justify-content-center displayDrawer"
            onClick={(event) => event.stopPropagation()}
            style={{ display: drawerDisplay }}>
            <Container>
              <Row className="justify-content-center h3">{dailyWeather.description}</Row>
              <Row className="g-2">
                <Col xs={12} md={4}>
                  <span className="daily-low">{tempDisplay(dailyWeather.minTemp)}</span>{' '}
                  <FontAwesomeIcon icon={faLongArrowAltRight} />{' '}
                  <span className="daily-high">{tempDisplay(dailyWeather.maxTemp)}</span>
                </Col>
                <Col xs={12} md={4}>
                  <FontAwesomeIcon icon={faSun} /> <span className="daily-sunrise">{dailyWeather.sunrise}</span>
                  <FontAwesomeIcon icon={faLongArrowAltUp} /> -{' '}
                  <span className="daily-sunset">{dailyWeather.sunset}</span>
                  <FontAwesomeIcon icon={faLongArrowAltDown} />
                </Col>
                <Col xs={12} md={4} className="type-data">
                  <span className="fw-bold">{precipitation.type}</span> {precipitation.value}
                </Col>
              </Row>
              {open ? <HourlyGraph heading="Hours" hourly={hourly} /> : null}
            </Container>
          </Row>
        </Container>
      </Row>
    );
  }
}
