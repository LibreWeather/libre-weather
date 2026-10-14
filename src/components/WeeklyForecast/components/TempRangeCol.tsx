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
    <div
      className={
        'type-data grid w-full min-w-0 grid-cols-[2.75rem_minmax(2.5rem,1fr)_2.75rem] items-center gap-x-[0.4rem] ' +
        'max-md:grid-cols-[2.25rem_minmax(1.5rem,1fr)_2.25rem] max-md:gap-x-1 max-md:text-[0.9em]'
      }>
      <span className="text-right whitespace-nowrap">{tempDisplay(minTemp)}</span>
      <div className="relative h-[0.65rem] min-w-0 rounded-[1em] bg-[#3c4144] max-md:h-2 compact:h-2" aria-hidden="true">
        <span
          className="absolute top-0 h-full rounded-[1em] bg-[#6c7a84]"
          style={{ left: `${start}%`, width: `${width}%` }} />
      </div>
      <span className="text-left whitespace-nowrap">{tempDisplay(maxTemp)}</span>
    </div>
  );
};
