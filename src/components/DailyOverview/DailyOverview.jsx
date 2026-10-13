import React, { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { WeatherIcon } from '../WeatherIcon';

import './DailyOverview.less';

import { getHourFromTimestamp } from '../../utilities';

const HOURS = 24;
const LONG_PRESS_MS = 500;

/** Higher = more precipitous. Used when a collapsed stretch covers mixed conditions. */
const CONDITION_RANK = {
  CLEAR: 0,
  PARTLY_CLOUDY: 1,
  CLOUDY: 2,
  FOG: 3,
  RAIN: 4,
  SNOW: 5,
  SLEET: 6,
};

const conditionName = (condition) => {
  switch (condition) {
    case 'RAIN':
      return 'Rain';
    case 'SNOW':
      return 'Snow';
    case 'SLEET':
      return 'Sleet';
    case 'PARTLY_CLOUDY':
      return 'Partly Cloudy';
    case 'CLOUDY':
      return 'Mostly Cloudy';
    case 'FOG':
      return 'Foggy';
    default:
      return 'Clear';
  }
};

const hourLayout = () => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    return { stride: 3, narrow: true };
  }
  if (window.matchMedia('(max-width: 991px)').matches) {
    return { stride: 3, narrow: false };
  }
  return { stride: 2, narrow: false };
};

const useHourLayout = () => {
  const [layout, setLayout] = useState(hourLayout);
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    const tablet = window.matchMedia('(max-width: 991px)');
    const onChange = () => setLayout(hourLayout());
    onChange();
    phone.addEventListener('change', onChange);
    tablet.addEventListener('change', onChange);
    return () => {
      phone.removeEventListener('change', onChange);
      tablet.removeEventListener('change', onChange);
    };
  }, []);
  return layout;
};

const pickHighest = (hours) =>
  hours.reduce((best, hour) =>
    (CONDITION_RANK[hour.condition] ?? 0) > (CONDITION_RANK[best.condition] ?? 0) ? hour : best
  );

const groupByStride = (hourly, stride) => {
  const bars = [];
  for (let i = 0; i < HOURS && i < hourly.length; i += stride) {
    const chunk = hourly.slice(i, Math.min(i + stride, HOURS));
    if (!chunk.length) {
      break;
    }
    const peak = pickHighest(chunk);
    const last = bars[bars.length - 1];
    if (last && last.condition === peak.condition) {
      last.hrCnt += chunk.length;
      last.endTime = chunk[chunk.length - 1].time;
    } else {
      bars.push({
        hrCnt: chunk.length,
        condition: peak.condition,
        time: peak.time,
        startTime: chunk[0].time,
        endTime: chunk[chunk.length - 1].time,
      });
    }
  }
  return bars;
};

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

const ConditionLabel = ({ condition, hrCnt, time, narrow }) => {
  let label = '';
  if (!narrow) {
    const name = conditionName(condition);
    if (condition === 'PARTLY_CLOUDY' || condition === 'CLOUDY') {
      label = hrCnt < 5 ? '' : name;
    } else {
      label = hrCnt < 3 ? '' : name;
    }
  }

  return (
    <>
      <WeatherIcon condition={condition} sizePx={15} time={time} />
      {label ? <span>{label}</span> : null}
    </>
  );
};

const ConditionBar = ({ hrCnt, condition, time, startTime, endTime, narrow }) => {
  const target = useRef(null);
  const pressTimer = useRef(null);
  const longPress = useRef(false);
  const [show, setShow] = useState(false);
  const name = conditionName(condition);
  const tip = `${name} · ${getHourFromTimestamp(startTime)}–${getHourFromTimestamp(endTime)}`;

  useEffect(() => () => clearTimeout(pressTimer.current), []);

  const clearPress = () => {
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return (
    <>
      <div
        ref={target}
        className={`overviewBar ${getConditionClass(condition)}`}
        style={{ gridColumn: `span ${hrCnt}` }}
        tabIndex={0}
        role="img"
        aria-label={tip}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => {
          if (!longPress.current) {
            setShow(false);
          }
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch') {
            return;
          }
          longPress.current = false;
          pressTimer.current = setTimeout(() => {
            longPress.current = true;
            setShow(true);
          }, LONG_PRESS_MS);
        }}
        onPointerUp={() => {
          const held = longPress.current;
          clearPress();
          if (held) {
            setTimeout(() => {
              longPress.current = false;
              setShow(false);
            }, 1800);
          }
        }}
        onPointerCancel={clearPress}
        onContextMenu={(event) => {
          if (longPress.current) {
            event.preventDefault();
          }
        }}>
        <div className="overviewBar-label">
          <ConditionLabel condition={condition} hrCnt={hrCnt} time={time} narrow={narrow} />
        </div>
      </div>
      <Overlay target={() => target.current} show={show} placement="top" flip rootClose onHide={() => setShow(false)}>
        {(props) => (
          <Tooltip id={`ov-tip-${startTime}-${condition}`} {...props}>
            {tip}
          </Tooltip>
        )}
      </Overlay>
    </>
  );
};

const OverviewBarCols = ({ hourlyWeather }) => {
  const { stride, narrow } = useHourLayout();
  if (!hourlyWeather?.length) {
    return null;
  }
  const normalizedData = groupByStride(hourlyWeather, stride);

  return normalizedData.map((bar) => (
    <ConditionBar key={`ovBar-${bar.startTime}-${bar.condition}`} narrow={narrow} {...bar} />
  ));
};

const OverviewDetailsColumns = ({ hourlyWeather }) => {
  const next24Hours = hourlyWeather.slice(0, HOURS);
  return next24Hours.map((hour) => (
    <div className="overviewDetails" key={`ovDetails-${hour.time}`}>
      <div className="overviewDetailsTime">{getHourFromTimestamp(hour.time)}</div>
      <div className="overviewDetailsTemp">{hour.temp}</div>
    </div>
  ));
};

export default class DailyOverview extends React.Component {
  #ticCols = Array.from(Array(HOURS).keys()).map((i) => (
    <div className="overviewTics" key={`ovTic-${i}`}>
      <div className={`${i % 2 === 0 ? 'even' : 'odd'}`}>&nbsp;</div>
    </div>
  ));

  render() {
    const { hourlyWeatherData: raw } = this.props;
    const weather = dailyWeather(raw);
    return (
      <Container className="dailyOverview forecast-col" fluid>
        <div className="hourGrid">
          <OverviewBarCols hourlyWeather={weather.hourly} />
        </div>
        <div className="hourGrid hourTics">{this.#ticCols}</div>
        <div className="hourGrid hourDetails">
          <OverviewDetailsColumns hourlyWeather={weather.hourly} />
        </div>
      </Container>
    );
  }
}
