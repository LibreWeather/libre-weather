import React, { useEffect, useRef, useState } from 'react';
import { WeatherIcon } from '@components/WeatherIcon';
import { useHourLayout } from '@/hooks/useHourLayout';
import type { OverviewBar, OverviewHour } from '@/models/forecast';
import type { Hourly } from '@/models/weather';
import { conditionClass } from '@/utilities/conditions';
import { formatHour } from '@/utilities/locale';
import { OVERVIEW_HOURS, groupByStride, overviewBarLabel, overviewBarTip, overviewHours } from '@/utilities/overview';

const LONG_PRESS_MS = 500;

const ConditionBar = ({ bar, narrow }: { bar: OverviewBar; narrow: boolean }) => {
  const { condition, hrCnt, time } = bar;
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
    <div
      className={
        `overviewBar ${conditionClass(condition)} relative flex min-w-0 cursor-help touch-manipulation ` +
        'items-center justify-center py-[0.5em] text-center leading-5 outline-none select-none ' +
        '[-webkit-touch-callout:none] not-first:shadow-[inset_1px_0_0_rgb(0_0_0/0.35)] first:rounded-l-md ' +
        'last:rounded-r-md max-md:py-[0.35em] max-md:leading-4 compact:py-[0.3em]! compact:leading-[14px]!'
      }
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
      <div className="flex max-w-full min-w-0 items-center justify-center gap-[0.3em] overflow-hidden [&_canvas]:block">
        <WeatherIcon condition={condition} sizePx={15} time={time} />
        {label ? <span>{label}</span> : null}
      </div>
      {show ? (
        <span
          role="tooltip"
          className={
            'pointer-events-none absolute bottom-full left-1/2 z-[1070] mb-2 -translate-x-1/2 rounded-md ' +
            'bg-black/90 px-2 py-1 text-sm leading-normal font-normal whitespace-nowrap text-white'
          }>
          {tip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-x-[0.4rem] border-t-[0.4rem] border-x-transparent border-t-black/90" />
        </span>
      ) : null}
    </div>
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

/** Below `lg` only every third hour is labelled; above it, every other. */
const detailVisibility = (i: number) =>
  `${i % 3 === 0 ? '' : 'max-lg:invisible '}${i % 2 === 0 ? '' : 'lg:invisible'}`;

const OverviewDetailsColumns = ({ hours }: { hours: OverviewHour[] }) =>
  hours.slice(0, OVERVIEW_HOURS).map((hour, i) => (
    <div className={`min-w-0 text-left ${detailVisibility(i)}`} key={`ovDetails-${hour.time}`}>
      <div className="overviewDetailsTime text-[0.75em]">{formatHour(hour.time)}</div>
      <div className="text-[1.25em] max-md:text-[1em] compact:text-[1em]">{hour.temp}</div>
    </div>
  ));

const ticClass = (i: number) => {
  const even = i % 2 === 0;
  const labelled = i % 3 === 0;
  return [
    'border-l border-dotted border-[#999]',
    even ? 'h-[5px]' : 'h-[10px]',
    labelled ? 'max-lg:h-[10px]' : '',
    even && !labelled ? 'compact:h-[3px]!' : 'compact:h-[6px]!',
  ].join(' ');
};

const TIC_COLS = Array.from(Array(OVERVIEW_HOURS).keys()).map((i) => (
  <div className={`pt-[0.25em] ${i % 3 === 0 ? '' : 'max-lg:invisible'}`} key={`ovTic-${i}`}>
    <div className={ticClass(i)}>&nbsp;</div>
  </div>
));

const DailyOverview = ({ hourlyWeatherData }: { hourlyWeatherData: Hourly[] }) => {
  const hours = overviewHours(hourlyWeatherData);
  return (
    <div className="dailyOverview forecast-col px-3 text-base compact:*:text-sm">
      <div className="grid w-full grid-cols-24">
        <OverviewBarCols hours={hours} />
      </div>
      <div className="hourTics grid w-full grid-cols-24">{TIC_COLS}</div>
      <div className="hourDetails type-data grid w-full grid-cols-24">
        <OverviewDetailsColumns hours={hours} />
      </div>
    </div>
  );
};

export default DailyOverview;
