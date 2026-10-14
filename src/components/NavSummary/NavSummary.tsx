import React from 'react';

import { WeatherIcon } from '@components/WeatherIcon';
import { useHeroOffscreen } from '@/hooks/useHero';
import { usePreferences } from '@/providers/PreferencesProvider';
import { useWeather } from '@/providers/WeatherProvider';
import { tempDisplay } from '@/utilities/formatters';

/** Current conditions for the navbar; CSS reveals it once the hero has scrolled away. */
const NavSummary = () => {
  const { weather } = useWeather();
  const { resolved } = usePreferences();
  const visible = useHeroOffscreen();

  if (!weather) return null;
  const { current } = weather;
  const text = current.summary || current.description;
  const label = [tempDisplay(current.temp), text].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={
        'navSummary pointer-events-none flex max-w-0 min-w-0 -translate-y-[0.35rem] items-center gap-[0.4rem] ' +
        'overflow-hidden rounded-lg py-[0.15rem] text-[0.95rem] whitespace-nowrap text-white opacity-0 ' +
        'transition-[max-width,opacity,translate,padding] duration-250 ease-in-out [&_canvas]:flex-none ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        'hero-off:pointer-events-auto hero-off:max-w-64 hero-off:translate-y-0 hero-off:px-2 hero-off:opacity-100 ' +
        'hero-off:hover:bg-white/8 max-md:hero-off:max-w-48'
      }
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label={`${label}, back to top`}
      onClick={() => window.scrollTo({ top: 0, behavior: resolved.reduceMotion ? 'auto' : 'smooth' })}>
      <WeatherIcon condition={current.condition} sizePx={22} />
      <span className="font-bold">{tempDisplay(current.temp)}</span>
      {text ? <span className="min-w-0 truncate text-white/75">{text}</span> : null}
    </button>
  );
};

export default NavSummary;
