import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { buildChart, hourPosition, barGeometry, num, TRACK_H, VIEW_HOURS } from '@/utilities/graph';
import { conditionClass } from '@/utilities/conditions';
import {
  numberDisplay,
  tempDisplay,
  tempSuffix,
  visibilityLabel,
  volumeDisplay,
  volumeLabel,
  windDisplay,
  windLabel,
} from '@/utilities/formatters';
import { formatHour } from '@/utilities/locale';
import type { Hourly } from '@/models/weather';
import type { ReactNode } from 'react';

const hourCols = 'grid grid-cols-[repeat(var(--hours),minmax(0,1fr))]';

const Line = ({
  points,
  color,
  dashed,
  dotted,
}: {
  points?: string | null;
  color: string;
  dashed?: boolean;
  dotted?: boolean;
}) =>
  points ? (
    <polyline
      className={
        'fill-none [stroke-width:1.6] [vector-effect:non-scaling-stroke]' +
        `${dashed ? ' [stroke-dasharray:4_3]' : ''}${dotted ? ' [stroke-dasharray:1.5_3]' : ''}`
      }
      points={points}
      stroke={color} />
  ) : null;

const Bars = ({
  values,
  min,
  max,
  color,
}: {
  values: Array<number | null>;
  min: number;
  max: number;
  color: string;
}) =>
  values.map((value, i) => {
    if (value == null || !Number.isFinite(value) || value <= 0) {
      return null;
    }
    const { top, height } = barGeometry(value, min, max);
    return (
      <rect
        className="opacity-85"
        fill={color}
        height={height}
        key={`bar-${i}`}
        width={0.62}
        x={i + 0.19}
        y={top} />
    );
  });

const Track = ({
  label,
  range,
  children,
  extra,
}: {
  label: string;
  range?: string;
  children?: ReactNode;
  extra?: ReactNode;
}) => (
  <div className="hourlyGraph-track relative mt-[0.15rem] h-[52px]">
    <div
      className={
        'type-label pointer-events-none sticky left-0 z-[2] flex h-full w-[4.4rem] flex-col justify-center ' +
        'bg-linear-to-r from-page from-72% to-page/0 pr-[0.35rem] text-[0.68rem] leading-[1.15] tracking-[0.04em] ' +
        'uppercase opacity-85 max-md:w-[3.4rem] max-md:text-[0.62rem]'
      }>
      <span>{label}</span>
      {range ? <span className="text-[0.62rem] tracking-normal normal-case opacity-55">{range}</span> : null}
    </div>
    {children}
    {extra}
  </div>
);

const Plot = ({ children, count }: { children?: ReactNode; count: number }) => (
  <svg className="hourlyGraph-plot absolute inset-0 block size-full" preserveAspectRatio="none" viewBox={`0 0 ${count} ${TRACK_H}`}>
    {children}
  </svg>
);

const HourlyGraph = ({ heading, hourly }: { heading?: string; hourly: Hourly[] }) => {
  const hours = useMemo(() => (hourly || []).filter(Boolean), [hourly]);
  const scroller = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; x: number; scroll: number } | null>(null);
  const nowPos = useMemo(() => hourPosition(hours, Date.now()), [hours]);
  const nowIndex = nowPos == null ? 0 : Math.floor(nowPos);
  const [hover, setHover] = useState(nowIndex);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || nowPos == null || !hours.length) {
      return;
    }
    el.scrollLeft = (el.scrollWidth * Math.max(0, nowIndex - 1)) / hours.length;
  }, [hours.length, nowIndex, nowPos]);

  const chart = useMemo(() => buildChart(hours), [hours]);

  if (hours.length < 2) {
    return null;
  }

  const active = hours[hover] || hours[0];
  const tempUnit = tempSuffix(hours.find((h) => h.temp?.unit)?.temp.unit);
  const precipUnit = volumeLabel(active?.precipVolume?.unit);
  const visUnit = visibilityLabel(active?.visibility?.unit);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      return;
    }
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      scroll: scroller.current?.scrollLeft || 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId || !scroller.current) {
      return;
    }
    scroller.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <section
      aria-label={`Hourly forecast, ${VIEW_HOURS} hour window`}
      className="hourlyGraph type-data mt-[0.85rem] w-full min-w-0 text-xs text-white"
      style={{ ['--hours' as string]: chart.count, ['--view-hours' as string]: VIEW_HOURS } as React.CSSProperties}>
      <div className="type-label mb-[0.35rem] flex items-baseline justify-between gap-3 text-[0.8rem] tracking-[0.02em]">
        <span>{heading || `${VIEW_HOURS} hour window`}</span>
        <span className="opacity-55">scroll →</span>
      </div>
      <div
        className={
          'hourlyGraph-scroll w-full min-w-0 cursor-grab snap-x snap-proximity overflow-x-auto overflow-y-hidden ' +
          '[scrollbar-color:rgb(255_255_255/0.28)_transparent] [scrollbar-width:thin] active:cursor-grabbing ' +
          '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/28'
        }
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        ref={scroller}>
        <div className="relative w-[calc(100%_*_var(--hours)_/_var(--view-hours))] min-w-full">
          <div className={`${hourCols} h-[0.55rem] overflow-hidden rounded-[2px]`}>
            {hours.map((hour) => (
              <div className={`min-w-0 snap-start ${conditionClass(hour.condition)}`} key={`ribbon-${hour.time}`} />
            ))}
          </div>
          <Track
            label="Temp"
            range={`${numberDisplay(chart.tempExt[0])}${tempUnit}–${numberDisplay(chart.tempExt[1])}${tempUnit}`}>
            <Plot count={chart.count}>
              <Line color="#7ec8e3" dotted points={chart.dewLine} />
              <Line color="#ff8a80" dashed points={chart.feelsLine} />
              <Line color="#ffb347" points={chart.tempLine} />
            </Plot>
          </Track>
          <Track label="Precip" range={`${numberDisplay(chart.precipExt[1], 2)} ${precipUnit}`}>
            <Plot count={chart.count}>
              <Bars color="#4d7fb0" max={100} min={0} values={chart.pops.map((v) => v ?? 0)} />
              <Line color="#9fd3ff" points={chart.precipLine} />
            </Plot>
          </Track>
          <Track label="Wind" range={`${numberDisplay(chart.windExt[1])} ${windLabel(active?.windspeed?.unit)}`}>
            <Plot count={chart.count}>
              <Line color="#d7c4a8" dashed points={chart.gustLine} />
              <Line color="#c5d0de" points={chart.windLine} />
            </Plot>
            <div className={`${hourCols} pointer-events-none absolute inset-0`}>
              {hours.map((hour) => (
                <span
                  className="flex items-start justify-center pt-[0.15rem] text-[0.7rem] opacity-70"
                  key={`wdir-${hour.time}`}>
                  <Icon
                    icon={faLongArrowAltDown}
                    rotate={Number(hour.windspeed?.direction) || 0} />
                </span>
              ))}
            </div>
          </Track>
          <Track label="Air" range="0–100%">
            <Plot count={chart.count}>
              <Line color="#8a93a3" dashed points={chart.cloudLine} />
              <Line color="#6ec6c0" points={chart.humLine} />
            </Plot>
          </Track>
          <Track label="Sun" range={`UV ${numberDisplay(chart.uvExt[1])}`}>
            <Plot count={chart.count}>
              <Bars color="#c9a227" max={chart.uvExt[1] || 11} min={0} values={chart.uvs.map((v) => v ?? 0)} />
              <Line color="#f0d060" points={chart.sunLine} />
            </Plot>
          </Track>
          <Track
            label="Pres"
            range={`${numberDisplay(chart.pressureExt[0])}–${numberDisplay(chart.pressureExt[1])} mb`}>
            <Plot count={chart.count}>
              <Line color="#8ecae6" dashed points={chart.visLine} />
              <Line color="#b39ddb" points={chart.pressureLine} />
            </Plot>
          </Track>
          <div className={`${hourCols} mt-[0.2rem]`}>
            {hours.map((hour) => (
              <div
                className="hourlyGraph-time min-w-0 snap-start overflow-hidden text-center text-[0.68rem] opacity-70"
                key={`t-${hour.time}`}>
                {formatHour(hour.time)}
              </div>
            ))}
          </div>
          {nowPos == null ? null : (
            <div
              className="hourlyGraph-now pointer-events-none absolute inset-y-0 z-[1] w-px bg-white/55"
              style={{ left: `${(nowPos / chart.count) * 100}%` }} />
          )}
          <div className={`${hourCols} absolute inset-0 z-[3]`}>
            {hours.map((hour, i) => (
              <button
                aria-label={hour.description || hour.condition}
                className={`hourlyGraph-hit min-w-0 cursor-[inherit] hover:bg-white/6 ${hover === i ? 'is-active bg-white/6' : ''}`}
                key={`hit-${hour.time}`}
                onBlur={() => setHover(nowIndex)}
                onFocus={() => setHover(i)}
                onMouseEnter={() => setHover(i)}
                type="button" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-[0.45rem] rounded bg-[#1b1e24]/85 px-[0.6rem] py-[0.45rem] leading-[1.35]">
        <div className="hourlyGraph-tip-title type-label mb-[0.15rem] text-[0.8rem]">
          {formatHour(active.time)} · {active.description || active.condition}
        </div>
        <div className="grid grid-cols-2 gap-x-[0.85rem] gap-y-[0.1rem] max-md:grid-cols-1">
          <span>
            Temp {tempDisplay(active.temp)} · feels {tempDisplay(active.apparentTemp)} · dew{' '}
            {tempDisplay(active.dewPoint)}
          </span>
          <span>
            Precip {numberDisplay(num(active.precipProbability))}% · {volumeDisplay(active.precipVolume)}
          </span>
          <span>Wind {windDisplay(active.windspeed)} · gust {windDisplay(active.windGust)}</span>
          <span>
            Humidity {numberDisplay(num(active.humidity))}% · clouds {numberDisplay(num(active.cloudCover))}%
          </span>
          <span>
            UV {numberDisplay(num(active.uvIndex), 1)} · sun {numberDisplay((num(active.sunshineDuration) ?? 0) / 36)}%
          </span>
          <span>
            {numberDisplay(num(active.pressure))} mb · vis {numberDisplay(num(active.visibility), 1)} {visUnit}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HourlyGraph;
