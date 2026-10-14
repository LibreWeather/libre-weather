import React from 'react';
import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { WeatherIcon } from '@components/WeatherIcon';
import { useTrackHero } from '@/hooks/useHero';
import type { Weather } from '@/models/weather';
import { usePreferences } from '@/providers/PreferencesProvider';
import { currentConditions } from '@/utilities/current';

const stat = 'px-3 compact:rounded-full compact:bg-white/6 compact:px-2 compact:py-[0.15rem]';

const CurrentWeather = ({ weatherData }: { weatherData: Weather }) => {
  const { resolved } = usePreferences();
  const hero = React.useRef<HTMLDivElement>(null);
  useTrackHero(hero);
  const currentWeather = currentConditions(weatherData);
  const { compact } = resolved;
  const { description } = currentWeather;

  return (
    <div className="current mx-auto w-full px-3">
      <div
        className={
          'currentTopBar type-data -mx-3 mb-[1.25em] flex flex-wrap justify-center gap-x-3 gap-y-[0.15em] ' +
          'text-base leading-tight font-medium compact:mb-3 compact:gap-[0.3rem] compact:text-xs'
        }>
        <div className={stat}>
          <span className="wind">
            <b>Wind:</b> {currentWeather.windSpeed}{' '}
          </span>
          <Icon icon={faLongArrowAltDown} rotate={currentWeather.windDeg} />
        </div>
        <div className={stat}>
          <b>Humidity:</b> {currentWeather.humidity}%
        </div>
        <div className={stat}>
          <b>Dew Pt:</b> {currentWeather.dewPoint}
        </div>
        {currentWeather.uvIndex ? (
          <div className={stat}>
            <b>UV Index:</b> {currentWeather.uvIndex}
          </div>
        ) : null}
        <div className={stat}>
          <b>Visibility:</b> {currentWeather.visibility}
        </div>
        <div className={stat}>
          <b>Pressure:</b> {currentWeather.pressure}
        </div>
      </div>
      <div
        className={
          'currentHero mx-auto flex max-w-xl flex-nowrap items-center justify-center gap-x-5 gap-y-3 px-2 ' +
          'max-md:gap-x-3 max-md:gap-y-2 compact:gap-[0.6rem]!'
        }
        ref={hero}>
        <WeatherIcon condition={currentWeather.condition} sizePx={compact ? 40 : 70} animate />
        <div className="min-w-0 text-left">
          <div
            className={
              'currentTemp m-0 font-serif text-[calc(1.375rem_+_1.5vw)] leading-[1.1] font-[650] ' +
              'tracking-[-0.02em] wrap-anywhere xl:text-[2.5rem] max-md:text-[2.15rem] ' +
              'compact:text-[1.75rem]!'
            }>
            {currentWeather.temp}
            {currentWeather.summary ? ` ${currentWeather.summary}` : ''}
          </div>
          <div
            className={
              'currentMeta type-data mt-[0.35rem] mb-2 flex flex-wrap gap-x-[0.85rem] gap-y-[0.15rem] text-base ' +
              'leading-tight font-medium compact:mt-[0.15rem] compact:text-[0.8rem]'
            }>
            <span>
              <b>Feels Like:</b> {currentWeather.tempFeelsLike}
            </span>
            <span>
              <b>Low:</b> {currentWeather.tempMin}
            </span>
            <span>
              <b>High:</b> {currentWeather.tempMax}
            </span>
            {compact && description ? <span className="currentMeta-description">{description}</span> : null}
          </div>
        </div>
      </div>
      {!compact && description ? (
        <div
          className={
            'currentDescription mb-2 flex justify-center font-serif text-[calc(1.325rem_+_0.9vw)] leading-tight ' +
            'font-semibold tracking-[-0.02em] xl:text-[2rem]'
          }>
          {description}
        </div>
      ) : null}
    </div>
  );
};

export default CurrentWeather;
