import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import CurrentDayContext from '../utilities/CurrentDayContext';
import { Condition } from '../utilities/weatherTypes';

type AnimatedWeather = typeof ReactAnimatedWeather & { defaultProps?: unknown };
delete (ReactAnimatedWeather as AnimatedWeather).defaultProps;

type WeatherIconProps = {
  condition: Condition;
  sizePx: number;
  time: number | null;
  animate?: boolean;
};

export const WeatherIcon = ({ condition, sizePx, time, animate = false }: WeatherIconProps) => {
  return (
    <CurrentDayContext.Consumer>
      {(context) => {
        let iconTime = time;
        let icon = condition as string;
        if (!iconTime) {
          iconTime = context.time;
        }
        const isDay = iconTime >= context.sunrise && iconTime < context.sunset;
        switch (condition) {
          case Condition.PARTLY_CLOUDY:
            icon = isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
            break;
          case Condition.CLEAR:
            icon = isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
        }
        return <ReactAnimatedWeather icon={icon} color="white" size={sizePx} animate={animate} />;
      }}
    </CurrentDayContext.Consumer>
  );
};
