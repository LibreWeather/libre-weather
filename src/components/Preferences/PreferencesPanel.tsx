import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { useModalDialog } from '@/hooks/useModalDialog';
import type { PreferenceChoiceKey, Preferences } from '@/models/preferences';
import { UnitSystem } from '@/models/weather';
import { usePreferences } from '@/providers/PreferencesProvider';
import { browserUses12HourClock } from '@/utilities/locale';
import { PHONE_QUERY, REDUCED_MOTION_QUERY, REDUCED_TRANSPARENCY_QUERY, mediaMatches } from '@/utilities/media';
import { isStandalone } from '@/utilities/platform';
import { resolveUnitSystem } from '@/utilities/preferences';

import './PreferencesPanel.less';

type Option<V extends string> = { value: V; label: string };

const Segmented = <K extends PreferenceChoiceKey>({
  name,
  label,
  options,
}: {
  name: K;
  label: string;
  options: Option<Preferences[K]>[];
}) => {
  const { preferences, setPreference } = usePreferences();
  return (
    <fieldset className="prefs-field">
      <legend>{label}</legend>
      <div className="prefs-segmented">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={preferences[name] === option.value}
              onChange={() => setPreference(name, option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const mediaLabel = (query: string) => (mediaMatches(query) ? 'on' : 'off');

type PreferencesPanelProps = {
  /** Gear button bounds; the panel drops down from it on wider screens. */
  anchor: DOMRect | null;
  onClose: () => void;
};

const PreferencesPanel = ({ anchor, onClose }: PreferencesPanelProps) => {
  const { ref, close, onBackdropClick } = useModalDialog();
  const titleId = React.useId();
  const { preferences, setPreference } = usePreferences();

  const autoImperial = resolveUnitSystem('auto') === UnitSystem.IMPERIAL;
  const system = resolveUnitSystem(preferences.temperature);
  const imperial = system === UnitSystem.IMPERIAL;
  const anchorStyle = anchor ?
      ({
        '--prefs-top': `${anchor.bottom + 8}px`,
        '--prefs-right': `${Math.max(window.innerWidth - anchor.right, 8)}px`,
      } as React.CSSProperties) :
    undefined;

  return (
    <dialog
      ref={ref}
      className={`prefsPanel${anchor ? ' is-anchored' : ''}`}
      style={anchorStyle}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdropClick}>
      <div className="prefsPanel-inner">
        <header className="prefsPanel-header">
          <h2 id={titleId}>Preferences</h2>
          <button type="button" className="prefsPanel-close" aria-label="Close" onClick={close}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className="prefsPanel-body">
          <section>
            <h3>Units</h3>
            <Segmented
              name="temperature"
              label="Temperature"
              options={[
                { value: 'auto', label: `Auto (${autoImperial ? '°F' : '°C'})` },
                { value: 'F', label: '°F' },
                { value: 'C', label: '°C' },
              ]} />
            <Segmented
              name="wind"
              label="Wind"
              options={[
                { value: 'auto', label: `Auto (${imperial ? 'mph' : 'm/s'})` },
                { value: 'mph', label: 'mph' },
                { value: 'kmh', label: 'km/h' },
                { value: 'ms', label: 'm/s' },
              ]} />
            <Segmented
              name="precip"
              label="Rain & snow"
              options={[
                { value: 'auto', label: `Auto (${imperial ? 'in' : 'mm'})` },
                { value: 'in', label: 'in' },
                { value: 'mm', label: 'mm' },
              ]} />
            <Segmented
              name="clock"
              label="Clock"
              options={[
                { value: 'auto', label: `Auto (${browserUses12HourClock() ? '12h' : '24h'})` },
                { value: '12', label: '12h' },
                { value: '24', label: '24h' },
              ]} />
          </section>

          <section>
            <h3>Display</h3>
            <Segmented
              name="layout"
              label="Compact layout"
              options={[
                { value: 'auto', label: `Auto (${mediaLabel(PHONE_QUERY)})` },
                { value: 'compact', label: 'On' },
                { value: 'comfortable', label: 'Off' },
              ]} />
            <Segmented
              name="motion"
              label="Reduce motion"
              options={[
                { value: 'auto', label: `Auto (${mediaLabel(REDUCED_MOTION_QUERY)})` },
                { value: 'reduce', label: 'On' },
                { value: 'full', label: 'Off' },
              ]} />
            <Segmented
              name="transparency"
              label="Reduce transparency"
              options={[
                { value: 'auto', label: `Auto (${mediaLabel(REDUCED_TRANSPARENCY_QUERY)})` },
                { value: 'reduce', label: 'On' },
                { value: 'full', label: 'Off' },
              ]} />
            <p className="prefs-hint">Turns off blur effects, which can save battery on older devices.</p>
          </section>

          <section>
            <h3>Alerts</h3>
            <label className="prefs-toggle">
              <span>
                Show weather alerts
                <small>Watches and warnings from the National Weather Service and MET Norway.</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={preferences.alerts}
                onChange={(event) => setPreference('alerts', event.target.checked)} />
            </label>
          </section>

          {preferences.installBannerDismissed && !isStandalone() ? (
            <section>
              <h3>App</h3>
              <button
                type="button"
                className="prefs-button"
                onClick={() => setPreference('installBannerDismissed', false)}>
                Show install banner again
              </button>
            </section>
          ) : null}
        </div>
      </div>
    </dialog>
  );
};

export default PreferencesPanel;
