import React from 'react';
import type { ForecastDay } from '@/models/forecast';
import { rangePercent } from '@/utilities/forecast';
import { tempDisplay } from '@/utilities/formatters';

export const TempRangeCol = ({
  dailyWeather,
  overallMinTemp,
  overallMaxTemp,
}: {
  dailyWeather: ForecastDay;
  overallMinTemp: number;
  overallMaxTemp: number;
}) => {
  const { minTemp, maxTemp } = dailyWeather;
  const start = rangePercent(Number(minTemp.value), overallMinTemp, overallMaxTemp);
  const end = rangePercent(Number(maxTemp.value), overallMinTemp, overallMaxTemp);
  const width = Math.max(end - start, 6);

  return (
    <div className="tempRange">
      <span className="tempRange-min">{tempDisplay(minTemp)}</span>
      <div className="tempRange-track" aria-hidden="true">
        <span
          className="tempRange-bar"
          style={{ left: `${start}%`, width: `${width}%` }} />
      </div>
      <span className="tempRange-max">{tempDisplay(maxTemp)}</span>
    </div>
  );
};
