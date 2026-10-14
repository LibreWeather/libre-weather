import React from 'react';
import {
  faLongArrowAltDown,
  faLongArrowAltRight,
  faLongArrowAltUp,
  faMinusCircle,
  faPlusCircle,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { WeatherIcon } from '@components/WeatherIcon';
import HourlyGraph from '@components/HourlyGraph';
import type { ForecastDay } from '@/models/forecast';
import type { Hourly } from '@/models/weather';
import { getDayOfTheWeek, tempDisplay } from '@/utilities/formatters';
import { TempRangeCol } from './TempRangeCol';

type DailyRowProps = {
  dailyWeather: ForecastDay;
  hourly: Hourly[];
  index: number;
  overallMinTemp: number;
  overallMaxTemp: number;
  open: boolean;
  onToggle: () => void;
};

export const DailyRow = ({
  dailyWeather,
  hourly,
  index,
  overallMinTemp,
  overallMaxTemp,
  open,
  onToggle,
}: DailyRowProps) => {
  const { precipitation } = dailyWeather;

  // TODO the temperature range details need to be updated to include the times (calculated by looking at the hourly data)
  return (
    <div
      className={
        'weeklyForecastRow rounded-lg border-white/7 not-first:border-t [.open+&]:border-t-transparent ' +
        (open ? 'open border-t-transparent bg-clear' : '')
      }>
      <div
        className={
          'buttonRow flex cursor-pointer flex-nowrap items-center gap-2 rounded-lg px-2.5 py-3.5 hover:bg-white/4 ' +
          'max-md:px-2 max-md:py-[0.8rem] compact:px-2! compact:py-[0.65rem]!'
        }
        onClick={onToggle}>
        <div className="mr-[0.1rem] flex-none">
          <WeatherIcon condition={dailyWeather.condition} sizePx={20} daytime />
        </div>
        <div className="forecastDayCol flex-none text-base font-bold whitespace-nowrap compact:text-[0.9rem]">
          {index === 0 ? 'Today' : getDayOfTheWeek(dailyWeather.time)}
        </div>
        <div className="min-w-0 flex-auto text-base compact:text-[0.9rem]">
          <TempRangeCol dailyWeather={dailyWeather} overallMinTemp={overallMinTemp} overallMaxTemp={overallMaxTemp} />
        </div>
        <div className="flex-none">
          <Icon icon={open ? faMinusCircle : faPlusCircle} />
        </div>
      </div>
      <div
        className={`displayDrawer px-[1.375rem] pt-1 pb-3.5 max-md:px-5 max-md:pb-3 ${open ? '' : 'hidden'}`}
        onClick={(event) => event.stopPropagation()}>
        <div
          className={
            'mb-2 flex justify-center font-serif text-[calc(1.3rem_+_0.6vw)] leading-tight font-semibold ' +
            'tracking-[-0.02em] xl:text-[1.75rem]'
          }>
          {dailyWeather.description}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <span className="type-data mr-[5px]">{tempDisplay(dailyWeather.minTemp)}</span>{' '}
            <Icon icon={faLongArrowAltRight} /> <span className="type-data ml-[5px]">{tempDisplay(dailyWeather.maxTemp)}</span>
          </div>
          <div>
            <Icon icon={faSun} /> <span className="type-data mr-[3px]">{dailyWeather.sunrise}</span>
            <Icon icon={faLongArrowAltUp} /> - <span className="type-data mr-[3px]">{dailyWeather.sunset}</span>
            <Icon icon={faLongArrowAltDown} />
          </div>
          <div className="type-data">
            <span className="font-bold">{precipitation.type}</span> {precipitation.value}
          </div>
        </div>
        {open ? <HourlyGraph heading="Hours" hourly={hourly} /> : null}
      </div>
    </div>
  );
};
