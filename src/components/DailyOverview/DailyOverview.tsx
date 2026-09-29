import React, { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { WeatherIcon } from '../WeatherIcon';

import './DailyOverview.less';

import { getHourFromTimestamp } from '../../utilities';
import { Condition, type Hourly, TempUnit, type Temperature } from '../../utilities/weatherTypes';

const HOURS = 24;
const LONG_PRESS_MS = 500;

/** Higher = more precipitous. Used when a collapsed stretch covers mixed conditions. */
const CONDITION_RANK: Record<Condition, number> = {
  [Condition.CLEAR]: 0,
  [Condition.PARTLY_CLOUDY]: 1,
  [Condition.CLOUDY]: 2,
  [Condition.FOG]: 3,
  [Condition.WIND]: 3,
  [Condition.RAIN]: 4,
  [Condition.SNOW]: 5,
  [Condition.SLEET]: 6,
};

const conditionName = (condition: Condition) => {
  switch (condition) {
    case Condition.RAIN:
      return 'Rain';
    case Condition.SNOW:
      return 'Snow';
    case Condition.SLEET:
      return 'Sleet';
    case Condition.PARTLY_CLOUDY:
      return 'Partly Cloudy';
    case Condition.CLOUDY:
      return 'Mostly Cloudy';
    case Condition.FOG:
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

type OverviewHour = { condition: Condition; time: number; temp?: string };

const pickHighest = (hours: OverviewHour[]) =>
  hours.reduce((best, hour) =>
    (CONDITION_RANK[hour.condition] ?? 0) > (CONDITION_RANK[best.condition] ?? 0) ? hour : best
  );

const groupByStride = (hourly: OverviewHour[], stride: number) => {
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

const tempDisplay = (temp: Temperature) =>
  `${Math.round(Number(temp.value))}${temp.unit === TempUnit.K ? 'K' : '˚'}`;

const dailyWeather = (data: Hourly[] | undefined) => ({
  hourly: (data ?? []).filter(Boolean).map(({ condition, temp, time }) => ({
    condition,
    temp: tempDisplay(temp),
    time,
  })),
});

const getConditionClass = (condition: Condition) => {
  switch (condition) {
    case Condition.RAIN:
    case Condition.SNOW:
    case Condition.SLEET:
      return 'rain';
    case Condition.PARTLY_CLOUDY:
      return 'partlyCloudy';
    case Condition.CLOUDY:
    case Condition.FOG:
      return 'mostlyCloudy';
    default:
      return 'clear';
  }
};

const ConditionLabel = ({
  condition,
  hrCnt,
  time,
  narrow,
}: {
  condition: Condition;
  hrCnt: number;
  time: number;
  narrow: boolean;
}) => {
  let label = '';
  if (!narrow) {
    const name = conditionName(condition);
    if (condition === Condition.PARTLY_CLOUDY || condition === Condition.CLOUDY) {
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

const ConditionBar = ({
  hrCnt,
  condition,
  time,
  startTime,
  endTime,
  narrow,
}: {
  hrCnt: number;
  condition: Condition;
  time: number;
  startTime: number;
  endTime: number;
  narrow: boolean;
}) => {
  const target = useRef<HTMLDivElement | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPress = useRef(false);
  const [show, setShow] = useState(false);
  const name = conditionName(condition);
  const tip = `${name} · ${getHourFromTimestamp(startTime)}–${getHourFromTimestamp(endTime)}`;

  useEffect(() => () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  }, []);

  const clearPress = () => {
    if (pressTimer.current != null) {
      clearTimeout(pressTimer.current);
    }
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

const OverviewBarCols = ({ hourlyWeather }: { hourlyWeather: OverviewHour[] }) => {
  const { stride, narrow } = useHourLayout();
  if (!hourlyWeather?.length) {
    return null;
  }
  const normalizedData = groupByStride(hourlyWeather, stride);

  return normalizedData.map((bar) => (
    <ConditionBar key={`ovBar-${bar.startTime}-${bar.condition}`} narrow={narrow} {...bar} />
  ));
};

const OverviewDetailsColumns = ({ hourlyWeather }: { hourlyWeather: OverviewHour[] }) => {
  const next24Hours = hourlyWeather.slice(0, HOURS);
  return next24Hours.map((hour) => (
    <div className="overviewDetails" key={`ovDetails-${hour.time}`}>
      <div className="overviewDetailsTime">{getHourFromTimestamp(hour.time)}</div>
      <div className="overviewDetailsTemp">{hour.temp}</div>
    </div>
  ));
};

export default class DailyOverview extends React.Component<{ hourlyWeatherData: Hourly[] }> {
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
