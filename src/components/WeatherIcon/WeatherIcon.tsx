import React from 'react';
import ReactAnimatedWeather from 'react-animated-weather';
import CurrentDayContext from '@/providers/CurrentDayContext';
import { usePreferences } from '@/providers/PreferencesProvider';
import { Condition } from '@/models/weather';

type AnimatedWeather = typeof ReactAnimatedWeather & { defaultProps?: unknown };
delete (ReactAnimatedWeather as AnimatedWeather).defaultProps;

type WeatherIconProps = {
  condition: Condition;
  sizePx: number;
  /** When null, today's current time decides between day and night. */
  time?: number | null;
  /** Always show the day variant, e.g. for whole-day forecasts. */
  daytime?: boolean;
  animate?: boolean;
};

export const WeatherIcon = ({ condition, sizePx, time = null, daytime = false, animate = false }: WeatherIconProps) => {
  const { resolved } = usePreferences();
  const day = React.useContext(CurrentDayContext);
  const at = time || day.time;
  const isDay = daytime || (at >= day.sunrise && at < day.sunset);
  let icon: string = condition;
  if (condition === Condition.PARTLY_CLOUDY) icon = isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
  if (condition === Condition.CLEAR) icon = isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
  return <ReactAnimatedWeather icon={icon} color="white" size={sizePx} animate={animate && !resolved.reduceMotion} />;
};
