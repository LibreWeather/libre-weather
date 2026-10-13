import React, { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { WeatherIcon } from '@components/WeatherIcon';
import { useHourLayout } from '@/hooks/useHourLayout';
import type { OverviewBar, OverviewHour } from '@/models/forecast';
import type { Hourly } from '@/models/weather';
import { conditionClass } from '@/utilities/conditions';
import { formatHour } from '@/utilities/locale';
import { OVERVIEW_HOURS, groupByStride, overviewBarLabel, overviewBarTip, overviewHours } from '@/utilities/overview';

import './DailyOverview.less';

const LONG_PRESS_MS = 500;

const ConditionBar = ({ bar, narrow }: { bar: OverviewBar; narrow: boolean }) => {
  const { condition, hrCnt, startTime, time } = bar;
  const target = useRef<HTMLDivElement | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPress = useRef(false);
  const [show, setShow] = useState(false);
  const tip = overviewBarTip(bar);
  const label = overviewBarLabel(bar, narrow);

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
        className={`overviewBar ${conditionClass(condition)}`}
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
          <WeatherIcon condition={condition} sizePx={15} time={time} />
          {label ? <span>{label}</span> : null}
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

const OverviewBarCols = ({ hours }: { hours: OverviewHour[] }) => {
  const { stride, narrow } = useHourLayout();
  if (!hours.length) {
    return null;
  }
  return groupByStride(hours, stride).map((bar) => (
    <ConditionBar key={`ovBar-${bar.startTime}-${bar.condition}`} bar={bar} narrow={narrow} />
  ));
};

const OverviewDetailsColumns = ({ hours }: { hours: OverviewHour[] }) =>
  hours.slice(0, OVERVIEW_HOURS).map((hour) => (
    <div className="overviewDetails" key={`ovDetails-${hour.time}`}>
      <div className="overviewDetailsTime">{formatHour(hour.time)}</div>
      <div className="overviewDetailsTemp">{hour.temp}</div>
    </div>
  ));

const TIC_COLS = Array.from(Array(OVERVIEW_HOURS).keys()).map((i) => (
  <div className="overviewTics" key={`ovTic-${i}`}>
    <div className={`${i % 2 === 0 ? 'even' : 'odd'}`}>&nbsp;</div>
  </div>
));

const DailyOverview = ({ hourlyWeatherData }: { hourlyWeatherData: Hourly[] }) => {
  const hours = overviewHours(hourlyWeatherData);
  return (
    <Container className="dailyOverview forecast-col" fluid>
      <div className="hourGrid">
        <OverviewBarCols hours={hours} />
      </div>
      <div className="hourGrid hourTics">{TIC_COLS}</div>
      <div className="hourGrid hourDetails">
        <OverviewDetailsColumns hours={hours} />
      </div>
    </Container>
  );
};

export default DailyOverview;
