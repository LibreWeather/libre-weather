import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { tempDisplay } from '../../../utilities/formatters';

const getTempPositionValue = (dayTempVal, totalMin, totalMax) =>
  ((dayTempVal - totalMin) / (totalMax - totalMin)) * 35 + 2;

export const TempRangeCol = ({ dailyWeather, overallMinTemp, overallMaxTemp }) => {
  const [variant, setVariant] = useState(window.innerWidth < 400 ? 'mobile' : undefined);
  useEffect(() => {
    setVariant(window.innerWidth < 400 ? 'mobile' : undefined);
  }, []);
  const { minTemp, maxTemp } = dailyWeather;
  const minTempPosition = getTempPositionValue(minTemp.value, overallMinTemp, overallMaxTemp);
  const maxTempPosition = getTempPositionValue(maxTemp.value, overallMinTemp, overallMaxTemp);
  const minColStyle = {
    flex: `0 0 ${minTempPosition}em`,
    msFlex: `0 0 ${minTempPosition}em`,
  };
  const maxColStyle = {
    flex: `0 0 ${37 - maxTempPosition}em`,
    msFlex: `0 0 ${37 - maxTempPosition}em`,
  };
  return (
    <Container>
      <Row>
        <Col className="minCol" style={minColStyle}>
          {tempDisplay(minTemp)}
        </Col>
        {variant !== 'mobile' ? <Col className="barCol" /> : undefined}
        <Col className="maxCol" style={maxColStyle}>
          {tempDisplay(maxTemp)}
        </Col>
      </Row>
    </Container>
  );
};
