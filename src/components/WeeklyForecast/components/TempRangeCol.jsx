import React from 'react';
import { tempDisplay } from '../../../utilities/formatters';

const toPct = (val, totalMin, totalMax) => {
  if (totalMax === totalMin) {
    return 50;
  }
  return ((val - totalMin) / (totalMax - totalMin)) * 100;
};

export const TempRangeCol = ({ dailyWeather, overallMinTemp, overallMaxTemp }) => {
  const { minTemp, maxTemp } = dailyWeather;
  const start = toPct(minTemp.value, overallMinTemp, overallMaxTemp);
  const end = toPct(maxTemp.value, overallMinTemp, overallMaxTemp);
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
