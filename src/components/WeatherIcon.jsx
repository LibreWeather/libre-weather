import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import CurrentDayContext from '../utilities/CurrentDayContext';

// eslint-disable-next-line import/prefer-default-export
export const WeatherIcon = ({ condition, sizePx, time, animate = false }) => {
  return (
    <CurrentDayContext.Consumer>
      {(context) => {
        if (!time) {
          time = context.time;
        }
        const isDay = time >= context.sunrise && time < context.sunset;
        switch (condition) {
          case 'PARTLY_CLOUDY':
            condition = isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
            break;
          case 'CLEAR':
            condition = isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
        }
        return <ReactAnimatedWeather icon={condition} color="white" size={sizePx} animate={animate} />;
      }}
    </CurrentDayContext.Consumer>
  );
};
