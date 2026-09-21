import React, { useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { getHourFromTimestamp, tempDisplay, volumeDisplay } from '@/utilities';
import { VIEW_HOURS, TRACK_H, num, extent, polyline, conditionClass } from './graphUtils';
import {
  TempUnit,
  VisibilityUnit,
  VolumeUnit,
  WindUnit,
  type Hourly,
  type Temperature,
  type Volume,
  type WindSpeed,
} from '@/utilities/weatherTypes';
import type { ReactNode } from 'react';
import './HourlyGraph.less';

const round = (value: number | null | undefined, digits = 0) => {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  const f = 10 ** digits;
  return `${Math.round(value * f) / f}`;
};

const tempOf = (temp?: Temperature) => (temp ? tempDisplay(temp) : '—');
const volOf = (volume?: Volume) => (volume && volume.value != null ? volumeDisplay(volume) : '0');
const windOf = (wind?: WindSpeed | null) => {
  if (!wind || wind.magnitude == null || wind.magnitude === '') {
    return '—';
  }
  return `${Math.round(num(wind) ?? 0)} ${wind.unit === WindUnit.MPH ? 'mph' : 'm/s'}`;
};

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
    const top = 4 + ((max - value) / (max - min || 1)) * (TRACK_H - 8);
    const height = Math.max(1, TRACK_H - 4 - top);
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

/**
 * @param {{ heading?: string, hourly: import('@/utilities/weatherTypes').Hourly[] }} props
 */
const HourlyGraph = ({ heading, hourly }: { heading?: string; hourly: Hourly[] }) => {
  const hours = useMemo(() => (hourly || []).filter(Boolean), [hourly]);
  const scroller = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; x: number; scroll: number } | null>(null);
  const [hover, setHover] = useState(0);

  const chart = useMemo(() => {
    const temps = hours.map((h) => num(h.temp));
    const feels = hours.map((h) => num(h.apparentTemp));
    const dew = hours.map((h) => num(h.dewPoint));
    const pops = hours.map((h) => num(h.precipProbability));
    const precips = hours.map((h) => num(h.precipVolume));
    const winds = hours.map((h) => num(h.windspeed));
    const gusts = hours.map((h) => num(h.windGust));
    const hums = hours.map((h) => num(h.humidity));
    const clouds = hours.map((h) => num(h.cloudCover));
    const uvs = hours.map((h) => num(h.uvIndex));
    const suns = hours.map((h) => {
      const s = num(h.sunshineDuration);
      return s == null ? null : (s / 3600) * 100;
    });
    const pressures = hours.map((h) => num(h.pressure));
    const vis = hours.map((h) => num(h.visibility));
    const tempExt = extent([...temps, ...feels, ...dew], 0.08);
    const precipExt = extent(precips.filter((v) => v != null), 0.1, [0, 0.2]);
    precipExt[0] = Math.min(0, precipExt[0]);
    const windExt = extent([...winds, ...gusts], 0.08, [0, 10]);
    windExt[0] = Math.min(0, windExt[0]);
    const uvExt = extent(uvs, 0.08, [0, 11]);
    uvExt[0] = 0;
    const pressureExt = extent(pressures, 0.08, [1000, 1020]);
    const visExt = extent(vis, 0.08, [0, 10]);
    visExt[0] = Math.min(0, visExt[0]);
    return {
      clouds,
      cloudLine: polyline(clouds, 0, 100, TRACK_H),
      count: hours.length,
      dew,
      dewLine: polyline(dew, ...tempExt, TRACK_H),
      feels,
      feelsLine: polyline(feels, ...tempExt, TRACK_H),
      gusts,
      gustLine: polyline(gusts, ...windExt, TRACK_H),
      hums,
      humLine: polyline(hums, 0, 100, TRACK_H),
      pops,
      precipExt,
      precips,
      precipLine: polyline(precips, ...precipExt, TRACK_H),
      pressureExt,
      pressureLine: polyline(pressures, ...pressureExt, TRACK_H),
      pressures,
      suns,
      tempExt,
      temps,
      tempLine: polyline(temps, ...tempExt, TRACK_H),
      uvExt,
      uvs,
      vis,
      visExt,
      visLine: polyline(vis, ...visExt, TRACK_H),
      windExt,
      windLine: polyline(winds, ...windExt, TRACK_H),
      winds,
    };
  }, [hours]);

  if (hours.length < 2) {
    return null;
  }

  const active = hours[hover] || hours[0];
  const unit = hours.find((h) => h.temp?.unit)?.temp.unit;
  const tempUnit = unit === TempUnit.K ? 'K' : '˚';
  const precipUnit = active?.precipVolume?.unit === VolumeUnit.IN ? 'in' : 'mm';
  const visUnit = active?.visibility?.unit === VisibilityUnit.MI ?
    'mi' :
    active?.visibility?.unit === VisibilityUnit.Percent ?
      '%' :
      'm';

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
            range={`${round(chart.tempExt[0])}${tempUnit}–${round(chart.tempExt[1])}${tempUnit}`}>
            <Plot count={chart.count}>
              <Line color="#7ec8e3" dotted points={chart.dewLine} />
              <Line color="#ff8a80" dashed points={chart.feelsLine} />
              <Line color="#ffb347" points={chart.tempLine} />
            </Plot>
          </Track>
          <Track label="Precip" range={`${round(chart.precipExt[1], 2)} ${precipUnit}`}>
            <Plot count={chart.count}>
              <Bars color="#4d7fb0" max={100} min={0} values={chart.pops.map((v) => v ?? 0)} />
              <Line color="#9fd3ff" points={chart.precipLine} />
            </Plot>
          </Track>
          <Track label="Wind" range={`${round(chart.windExt[1])} ${active?.windspeed?.unit === WindUnit.MPH ? 'mph' : 'm/s'}`}>
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
          <Track label="Sun" range={`UV ${round(chart.uvExt[1])}`}>
            <Plot count={chart.count}>
              <Bars color="#c9a227" max={chart.uvExt[1] || 11} min={0} values={chart.uvs.map((v) => v ?? 0)} />
              <Line color="#f0d060" points={polyline(chart.suns, 0, 100, TRACK_H)} />
            </Plot>
          </Track>
          <Track
            label="Pres"
            range={`${round(chart.pressureExt[0])}–${round(chart.pressureExt[1])} mb`}>
            <Plot count={chart.count}>
              <Line color="#8ecae6" dashed points={chart.visLine} />
              <Line color="#b39ddb" points={chart.pressureLine} />
            </Plot>
          </Track>
          <div className="hourlyGraph-times">
            {hours.map((hour) => (
              <div className="hourlyGraph-time" key={`t-${hour.time}`}>
                {getHourFromTimestamp(hour.time)}
              </div>
            ))}
          </div>
          <div className="hourlyGraph-hits">
            {hours.map((hour, i) => (
              <button
                aria-label={hour.description || hour.condition}
                className={`hourlyGraph-hit${hover === i ? ' is-active' : ''}`}
                key={`hit-${hour.time}`}
                onBlur={() => setHover(0)}
                onFocus={() => setHover(i)}
                onMouseEnter={() => setHover(i)}
                type="button" />
            ))}
          </div>
        </div>
      </div>
      <div className="hourlyGraph-tip">
        <div className="hourlyGraph-tip-title">
          {getHourFromTimestamp(active.time)} · {active.description || active.condition}
        </div>
        <div className="hourlyGraph-tip-grid">
          <span>Temp {tempOf(active.temp)} · feels {tempOf(active.apparentTemp)} · dew {tempOf(active.dewPoint)}</span>
          <span>
            Precip {round(num(active.precipProbability))}% · {volOf(active.precipVolume)}
          </span>
          <span>Wind {windOf(active.windspeed)} · gust {windOf(active.windGust)}</span>
          <span>
            Humidity {round(num(active.humidity))}% · clouds {round(num(active.cloudCover))}%
          </span>
          <span>
            UV {round(num(active.uvIndex), 1)} · sun {round((num(active.sunshineDuration) ?? 0) / 36)}%
          </span>
          <span>
            {round(num(active.pressure))} mb · vis {round(num(active.visibility), 1)} {visUnit}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HourlyGraph;
