import React from 'react';
import CurrentDayContext from '@/providers/CurrentDayContext';
import { usePreferences } from '@/providers/PreferencesProvider';
import { Condition } from '@/models/weather';
import { METEOCONS_ANIMATED } from './animatedIcons';
import { METEOCONS } from './icons';

type WeatherIconProps = {
  condition: Condition;
  sizePx: number;
  /** When null, today's current time decides between day and night. */
  time?: number | null;
  /** Always show the day variant, e.g. for whole-day forecasts. */
  daytime?: boolean;
  /** Play the Meteocons motion. Daily rows leave this off. */
  animate?: boolean;
};

const iconName = (condition: Condition, isDay: boolean) => {
  switch (condition) {
    case Condition.CLEAR:
      return isDay ? 'clear-day' : 'clear-night';
    case Condition.PARTLY_CLOUDY:
      return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    case Condition.CLOUDY:
      return 'cloudy';
    case Condition.LIGHT_RAIN:
      return 'drizzle';
    case Condition.RAIN:
      return 'rain';
    case Condition.SNOW:
      return 'snow';
    case Condition.SLEET:
      return 'sleet';
    case Condition.FOG:
      return 'fog';
    case Condition.WIND:
      return 'wind';
    default:
      return 'cloudy';
  }
};

/** SVG mask ids must be unique once several icons are on the page. */
const scopeIds = (svg: string, suffix: string) => svg
  .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${id}-${suffix}"`)
  .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${id}-${suffix})`);

const play = (root: HTMLElement) => {
  root.querySelectorAll('animate, animateTransform, animateMotion').forEach((node) => {
    if ('beginElement' in node && typeof node.beginElement === 'function') node.beginElement();
  });
};

export const WeatherIcon = ({
  condition,
  sizePx,
  time = null,
  daytime = false,
  animate = false,
}: WeatherIconProps) => {
  const { resolved } = usePreferences();
  const day = React.useContext(CurrentDayContext);
  const root = React.useRef<HTMLSpanElement>(null);
  const at = time || day.time;
  const isDay = daytime || (at >= day.sunrise && at < day.sunset);
  const moving = animate && !resolved.reduceMotion;
  const rawId = React.useId().replace(/:/g, '');
  // Static strokes are sized for a 128px artboard. Double them so a 20px row still reads.
  const art = scopeIds((moving ? METEOCONS_ANIMATED : METEOCONS)[iconName(condition, isDay)], rawId);
  const svg = moving ? art : art.replace(/stroke-width="([\d.]+)"/g, (_, width: string) => `stroke-width="${Number(width) * 2}"`);

  React.useEffect(() => {
    if (moving && root.current) play(root.current);
  }, [moving, svg]);

  return (
    <span
      ref={root}
      className="inline-block shrink-0 text-white [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
      style={{ width: sizePx, height: sizePx }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
};
