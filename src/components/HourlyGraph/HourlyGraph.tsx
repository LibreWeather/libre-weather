import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
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
import './HourlyGraph.less';

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
      className={`hourlyGraph-line${dashed ? ' is-dashed' : ''}${dotted ? ' is-dotted' : ''}`}
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
        className="hourlyGraph-bar"
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
  <div className="hourlyGraph-track">
    <div className="hourlyGraph-label">
      <span>{label}</span>
      {range ? <span className="hourlyGraph-range">{range}</span> : null}
    </div>
    {children}
    {extra}
  </div>
);

const Plot = ({ children, count }: { children?: ReactNode; count: number }) => (
  <svg className="hourlyGraph-plot" preserveAspectRatio="none" viewBox={`0 0 ${count} ${TRACK_H}`}>
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
      className="hourlyGraph"
      style={{ ['--hours' as string]: chart.count, ['--view-hours' as string]: VIEW_HOURS } as React.CSSProperties}>
      <div className="hourlyGraph-head">
        <span>{heading || `${VIEW_HOURS} hour window`}</span>
        <span className="hourlyGraph-hint">scroll →</span>
      </div>
      <div
        className="hourlyGraph-scroll"
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        ref={scroller}>
        <div className="hourlyGraph-pane">
          <div className="hourlyGraph-ribbon">
            {hours.map((hour) => (
              <div
                className={`hourlyGraph-ribbon-cell ${conditionClass(hour.condition)}`}
                key={`ribbon-${hour.time}`} />
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
            <div className="hourlyGraph-windDirs">
              {hours.map((hour) => (
                <span className="hourlyGraph-windDir" key={`wdir-${hour.time}`}>
                  <FontAwesomeIcon
                    icon={faLongArrowAltDown}
                    transform={{ rotate: Number(hour.windspeed?.direction) || 0 }} />
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
          <div className="hourlyGraph-times">
            {hours.map((hour) => (
              <div className="hourlyGraph-time" key={`t-${hour.time}`}>
                {formatHour(hour.time)}
              </div>
            ))}
          </div>
          {nowPos == null ? null : (
            <div className="hourlyGraph-now" style={{ left: `${(nowPos / chart.count) * 100}%` }} />
          )}
          <div className="hourlyGraph-hits">
            {hours.map((hour, i) => (
              <button
                aria-label={hour.description || hour.condition}
                className={`hourlyGraph-hit${hover === i ? ' is-active' : ''}`}
                key={`hit-${hour.time}`}
                onBlur={() => setHover(nowIndex)}
                onFocus={() => setHover(i)}
                onMouseEnter={() => setHover(i)}
                type="button" />
            ))}
          </div>
        </div>
      </div>
      <div className="hourlyGraph-tip">
        <div className="hourlyGraph-tip-title">
          {formatHour(active.time)} · {active.description || active.condition}
        </div>
        <div className="hourlyGraph-tip-grid">
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
