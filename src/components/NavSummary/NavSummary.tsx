import React from 'react';

import { usePreferences } from '../../providers/PreferencesProvider';
import { useWeather } from '../../providers/WeatherProvider';
import { tempDisplay } from '../../utilities/formatters';
import { WeatherIcon } from '@components/WeatherIcon';

import './NavSummary.less';

/** Current conditions for the navbar; CSS reveals it once the hero has scrolled away. */
const NavSummary = () => {
  const { weather } = useWeather();
  const { resolved } = usePreferences();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => setVisible(root.classList.contains('hero-offscreen'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!weather) return null;
  const { current } = weather;
  const text = current.summary || current.description;
  const label = [tempDisplay(current.temp), text].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className="navSummary"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label={`${label}, back to top`}
      onClick={() => window.scrollTo({ top: 0, behavior: resolved.reduceMotion ? 'auto' : 'smooth' })}>
      <WeatherIcon condition={current.condition} sizePx={22} time={null} />
      <span className="navSummary-temp">{tempDisplay(current.temp)}</span>
      {text ? <span className="navSummary-text">{text}</span> : null}
    </button>
  );
};

export default NavSummary;
