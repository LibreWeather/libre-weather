import React from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';

import { useModalDialog } from '@/hooks/useModalDialog';
import type { PreferenceChoiceKey, Preferences } from '@/models/preferences';
import { UnitSystem } from '@/models/weather';
import { usePreferences } from '@/providers/PreferencesProvider';
import { browserUses12HourClock } from '@/utilities/locale';
import { PHONE_QUERY, REDUCED_MOTION_QUERY, REDUCED_TRANSPARENCY_QUERY, mediaMatches } from '@/utilities/media';
import { isStandalone } from '@/utilities/platform';
import { resolveUnitSystem } from '@/utilities/preferences';

type Option<V extends string> = { value: V; label: string };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-white/7 not-first:mt-4 not-first:border-t not-first:pt-[0.9rem]">
    <h3 className="mb-2 font-sans text-[0.72rem] font-[650] tracking-[0.06em] text-white/50 uppercase">{title}</h3>
    {children}
  </section>
);

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
    <fieldset className="prefs-field mb-[0.7rem]">
      <legend className="mb-[0.3rem] text-[0.88rem] font-[550]">{label}</legend>
      <div className="flex gap-0.5 rounded-[0.55rem] bg-white/6 p-0.5">
        {options.map((option) => (
          <label key={option.value} className="relative min-w-0 flex-auto">
            <input
              className="peer pointer-events-none absolute opacity-0"
              type="radio"
              name={name}
              value={option.value}
              checked={preferences[name] === option.value}
              onChange={() => setPreference(name, option.value)} />
            <span
              className={
                'block cursor-pointer rounded-[0.45rem] px-2 py-[0.35rem] text-center text-[0.82rem] whitespace-nowrap ' +
                'text-white/75 transition-colors hover:text-white peer-checked:bg-[#3a3f47] peer-checked:font-semibold ' +
                'peer-checked:text-white peer-checked:shadow-[0_1px_2px_rgb(0_0_0/0.35)] ' +
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent'
              }>
              {option.label}
            </span>
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
      className={
        'prefsPanel w-[min(24rem,calc(100vw_-_2rem))] rounded-[0.875rem] border border-white/10 bg-panel p-0 ' +
        'text-left text-[0.95rem] text-white shadow-[0_1rem_3rem_rgb(0_0_0/0.5)] ' +
        (anchor ?
          'is-anchored fixed inset-[var(--prefs-top)_var(--prefs-right)_auto_auto] m-0 ' +
          'max-h-[calc(100dvh_-_var(--prefs-top)_-_1rem)] backdrop:bg-transparent' :
          'm-auto max-h-[calc(100dvh_-_4rem)] backdrop:bg-[rgb(10_12_15/0.35)] max-md:fixed max-md:inset-[auto_0_0] ' +
          'max-md:m-0 max-md:max-h-[85dvh] max-md:w-screen max-md:max-w-[100vw] max-md:rounded-t-2xl ' +
          'max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:backdrop:bg-[rgb(10_12_15/0.5)]')
      }
      style={anchorStyle}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdropClick}>
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-center justify-between pt-3 pr-3 pb-2 pl-[1.1rem]">
          <h2 id={titleId} className="font-sans text-[1.05rem] font-bold tracking-normal">
            Preferences
          </h2>
          <button
            type="button"
            className="prefsPanel-close grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/8 hover:text-white"
            aria-label="Close"
            onClick={close}>
            <Icon icon={faXmark} />
          </button>
        </header>

        <div
          className={
            'overflow-y-auto overscroll-contain px-[1.1rem] pb-[1.1rem] ' +
            'max-md:pb-[max(1.1rem,env(safe-area-inset-bottom))]'
          }>
          <Section title="Units">
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
          </Section>

          <Section title="Display">
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
            <p className="-mt-[0.3rem] text-[0.78rem] text-white/50">
              Turns off blur effects, which can save battery on older devices.
            </p>
          </Section>

          <Section title="Alerts">
            <label className="prefs-toggle flex cursor-pointer items-center justify-between gap-4">
              <span className="flex flex-col text-[0.88rem] font-[550]">
                Show weather alerts
                <small className="mt-[0.15rem] text-[0.78rem] font-normal text-white/50">
                  Watches and warnings from the National Weather Service and MET Norway.
                </small>
              </span>
              <input
                className={
                  'relative h-[1.4rem] w-[2.4rem] flex-none cursor-pointer appearance-none rounded-2xl bg-white/18 ' +
                  'transition-colors after:absolute after:top-[0.15rem] after:left-[0.15rem] after:size-[1.1rem] ' +
                  'after:rounded-full after:bg-white after:transition-transform checked:bg-accent ' +
                  'checked:after:translate-x-4 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
                  'focus-visible:outline-accent'
                }
                type="checkbox"
                role="switch"
                checked={preferences.alerts}
                onChange={(event) => setPreference('alerts', event.target.checked)} />
            </label>
          </Section>

          {preferences.installBannerDismissed && !isStandalone() ? (
            <Section title="App">
              <button
                type="button"
                className={
                  'rounded-lg border border-white/15 bg-white/5 px-[0.8rem] py-[0.4rem] text-[0.85rem] text-white ' +
                  'hover:bg-white/10'
                }
                onClick={() => setPreference('installBannerDismissed', false)}>
                Show install banner again
              </button>
            </Section>
          ) : null}
        </div>
      </div>
    </dialog>
  );
};

export default PreferencesPanel;
