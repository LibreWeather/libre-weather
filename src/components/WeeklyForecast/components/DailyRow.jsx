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
    const { dailyWeather, index, overallMinTemp, overallMaxTemp } = this.props;
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
          <Row className="i buttonRow" onClick={this.handleRowClick}>
            <Col className="iconCol">
              <WeatherIcon condition={dailyWeather.condition} sizePx={20} time={conditionTime} />
            </Col>
            <Col className="forecastDayCol">{index === 0 ? 'Today' : getDayOfTheWeek(dailyWeather.time)}</Col>
            <Col className="tempRangeCol">
              <TempRangeCol
                dailyWeather={dailyWeather}
                overallMinTemp={overallMinTemp}
                overallMaxTemp={overallMaxTemp}
              />
            </Col>
            <Col className="toggleCol">
              <FontAwesomeIcon icon={drawerIcon} />
            </Col>
          </Row>
          <Row className="justify-content-center displayDrawer" style={{ display: drawerDisplay }}>
            <Container>
              <Row className="justify-content-center h3">{dailyWeather.description}</Row>
              <Row>
                <Col>
                  <span className="daily-low">{tempDisplay(dailyWeather.minTemp)}</span>{' '}
                  <FontAwesomeIcon icon={faLongArrowAltRight} />{' '}
                  <span className="daily-high">{tempDisplay(dailyWeather.maxTemp)}</span>
                </Col>
                <Col>
                  <FontAwesomeIcon icon={faSun} /> <span className="daily-sunrise">{dailyWeather.sunrise}</span>
                  <FontAwesomeIcon icon={faLongArrowAltUp} /> -{' '}
                  <span className="daily-sunset">{dailyWeather.sunset}</span>
                  <FontAwesomeIcon icon={faLongArrowAltDown} />
                </Col>
                <Col>
                  <span className="font-weight-bold">{precipitation.type}</span> {precipitation.value}
                </Col>
              </Row>
            </Container>
          </Row>
        </Container>
      </Row>
    );
  }
}
