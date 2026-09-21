import React from 'react';
import { tempDisplay } from '../../../utilities/formatters';
import type { DailyRowWeather } from './DailyRow';

const toPct = (val: number, totalMin: number, totalMax: number) => {
  if (totalMax === totalMin) {
    return 50;
  }
  return ((val - totalMin) / (totalMax - totalMin)) * 100;
};

export const TempRangeCol = ({
  dailyWeather,
  overallMinTemp,
  overallMaxTemp,
}: {
  dailyWeather: DailyRowWeather;
  overallMinTemp: number;
  overallMaxTemp: number;
}) => {
  const { minTemp, maxTemp } = dailyWeather;
  const start = toPct(Number(minTemp.value), overallMinTemp, overallMaxTemp);
  const end = toPct(Number(maxTemp.value), overallMinTemp, overallMaxTemp);
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
