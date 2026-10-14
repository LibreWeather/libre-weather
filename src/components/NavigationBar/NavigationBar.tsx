import React from 'react';
import { faGear, faSearch, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faOsi } from '@fortawesome/free-brands-svg-icons';
import Icon from '@components/Icon';

import Link from '@components/Link';
import Logo from '@components/Logo';
import NavSummary from '@components/NavSummary';
import PreferencesPanel from '@components/Preferences';
import useDialogParam from '@/hooks/useDialogParam';
import { usePlace } from '@/providers/PlaceProvider';
import { PHONE_QUERY, mediaMatches } from '@/utilities/media';
import { placeLabel } from '@/utilities/place';

const groupItem = 'relative -ml-px border px-3 py-1.5 first:ml-0 first:rounded-l-md last:rounded-r-md';
const groupButton =
  `${groupItem} border-muted text-muted outline-none hover:bg-muted hover:text-white ` +
  'focus-visible:z-10 focus-visible:shadow-[0_0_0_0.25rem_rgb(108_117_125/0.5)] ' +
  'aria-expanded:bg-muted aria-expanded:text-white aria-pressed:bg-muted aria-pressed:text-white ' +
  'disabled:opacity-65 disabled:hover:bg-transparent disabled:hover:text-muted';
const iconButton =
  'grid size-9 place-items-center rounded-lg border border-white/12 text-white/75 hover:bg-white/8 hover:text-white ' +
  'aria-expanded:bg-white/8 aria-expanded:text-white focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-accent';
const brandLink = 'block px-[0.45rem] py-[0.3rem] text-white/72 transition-colors hover:text-white focus:text-white';

const NavigationBar = () => {
  const { zip, locationName, useGeo, geoAvailable, options, searchZip, toggleGeo, chooseLocation } = usePlace();
  const zipInput = React.useRef<HTMLInputElement>(null);
  const locationForm = React.useRef<HTMLFormElement>(null);
  const [showOptions, setShowOptions] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const prefs = useDialogParam('prefs');
  const gearButton = React.useRef<HTMLButtonElement>(null);
  const [prefsAnchor, setPrefsAnchor] = React.useState<DOMRect | null>(null);

  React.useLayoutEffect(() => {
    if (prefs.value === null) return;
    setPrefsAnchor(mediaMatches(PHONE_QUERY) ? null : gearButton.current?.getBoundingClientRect() ?? null);
  }, [prefs.value]);

  React.useEffect(() => {
    if (!showOptions) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!locationForm.current?.contains(event.target as Node)) setShowOptions(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowOptions(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showOptions]);

  const handleZipSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = zipInput.current?.value.trim();
    if (query) {
      setShowOptions(true);
      searchZip(query);
    }
    event.currentTarget.reset();
  };

  return (
    <nav
      className={
        'app-navbar sticky top-[max(0.75rem,env(safe-area-inset-top))] z-[1030] mx-auto ' +
        'mt-[max(0.75rem,env(safe-area-inset-top))] flex ' +
        'w-[calc(100%_-_2rem_-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] ' +
        'max-w-5xl flex-wrap items-center justify-between rounded-xl border ' +
        'border-white/8 bg-clear/82 px-[1.15rem] py-[0.65rem] shadow-[0_10px_28px_rgb(0_0_0/0.35)] ' +
        'backdrop-blur-md backdrop-saturate-[1.4] reduce-transparency:bg-clear lg:flex-nowrap lg:justify-start ' +
        'max-md:top-[max(0.5rem,env(safe-area-inset-top))] max-md:mt-[max(0.5rem,env(safe-area-inset-top))] ' +
        'max-md:w-[calc(100%_-_1rem_-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] ' +
        'max-md:px-[0.85rem] max-md:py-[0.55rem]'
      }>
      <div className="app-brand mr-3 flex min-w-0 flex-nowrap items-center max-md:hero-off:mr-1">
        <Link
          to="/"
          className={
            'app-home mr-[0.15rem] flex items-center gap-2 font-serif text-xl font-semibold whitespace-nowrap ' +
            'tracking-[-0.02em] text-white'
          }>
          <Logo width="30" height="30" className="inline-block" />
          <span className="max-md:hero-off:hidden">Libre Weather</span>
        </Link>
        <div className="app-brand-links flex max-md:hero-off:hidden">
          <Link to="/licenses" aria-label="Licenses" className={brandLink}>
            <Icon icon={faOsi} />
          </Link>
          <a
            aria-label="GitHub"
            className={brandLink}
            href="https://github.com/LibreWeather/libre-weather"
            rel="noreferrer"
            target="_blank">
            <Icon icon={faGithub} />
          </a>
        </div>
      </div>

      <NavSummary />

      <button
        type="button"
        ref={gearButton}
        className={`${iconButton} mr-[0.4rem] ml-auto lg:order-3 lg:mr-0 lg:ml-3`}
        aria-label="Preferences"
        aria-haspopup="dialog"
        aria-expanded={prefs.value !== null}
        onClick={() => prefs.open()}>
        <Icon icon={faGear} />
      </button>

      <button
        type="button"
        className={
          'app-menu-toggle rounded-md border border-white/15 px-[0.45rem] py-[0.2rem] text-[0.95rem] leading-none ' +
          'text-white/55 transition-shadow focus-visible:shadow-[0_0_0_0.25rem] focus-visible:outline-none lg:hidden'
        }
        aria-controls="app-settings"
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((open) => !open)}>
        <svg className="size-[1.5em] align-middle" viewBox="0 0 30 30" aria-hidden="true">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4 7h22M4 15h22M4 23h22" />
        </svg>
      </button>

      <div
        id="app-settings"
        className={`${menuOpen ? 'flex' : 'hidden'} grow basis-full items-stretch lg:flex lg:basis-auto`}>
        <div
          className={
            'app-settings flex w-full flex-col items-stretch gap-[0.7rem] pt-3 pb-[0.35rem] text-white/75 ' +
            'lg:ml-auto lg:w-auto lg:flex-row lg:items-center lg:justify-end lg:gap-3 lg:p-0'
          }>
          <form
            ref={locationForm}
            className={
              'app-settings-location relative ml-[25%] w-1/2 max-w-[50%] min-w-0 self-start ' +
              'lg:ml-0 lg:w-auto lg:max-w-none lg:min-w-88 lg:flex-[1_1_22rem] lg:self-auto'
            }
            onSubmit={handleZipSubmit}>
            <div className="flex w-full flex-nowrap items-stretch">
              <button
                type="button"
                className={groupButton}
                aria-label="Use my location"
                aria-pressed={useGeo}
                disabled={!geoAvailable}
                onClick={toggleGeo}>
                <Icon icon={faLocationArrow} />
              </button>
              {options.length ? (
                <button
                  type="button"
                  id="location-options"
                  className={groupButton}
                  aria-label="Matching places"
                  aria-haspopup="listbox"
                  aria-expanded={showOptions}
                  onClick={() => setShowOptions((show) => !show)}>
                  <span className="inline-block border-x-[0.3em] border-t-[0.3em] border-b-0 border-x-transparent align-[0.255em]" />
                </button>
              ) : null}
              <span
                id="locationName"
                className={
                  `${groupItem} app-settings-place block max-w-29 truncate border-field-border bg-field-addon ` +
                  'lg:max-w-40'
                }>
                {locationName}
              </span>
              <input
                className={
                  `${groupItem} w-[1%] min-w-0 grow border-field-border bg-field text-field-text ` +
                  'placeholder:text-field-text/75 focus:z-10 focus:border-focus focus:outline-none ' +
                  'focus:shadow-[0_0_0_0.25rem_rgb(13_110_253/0.25)]'
                }
                placeholder={zip || 'ZIP Code'}
                aria-label="ZIP Code"
                aria-describedby="locationName"
                ref={zipInput}
                autoComplete="postal-code" />
              <button type="submit" className={groupButton} aria-label="Search">
                <Icon icon={faSearch} />
              </button>
            </div>
            {options.length && showOptions ? (
              <ul
                className={
                  'absolute top-full left-0 z-[1000] mt-0.5 min-w-40 rounded-md border border-white/15 bg-field ' +
                  'py-2 text-field-text'
                }
                role="listbox"
                aria-label="Matching places">
                {options.map((option) => (
                  <li key={option.place_id ?? `${option.lat},${option.lon}`} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      className={
                        'app-location-option block w-full px-4 py-1 text-left whitespace-nowrap ' +
                        'hover:bg-field-addon focus-visible:bg-field-addon focus-visible:outline-none'
                      }
                      onClick={() => {
                        chooseLocation(option);
                        setShowOptions(false);
                      }}>
                      {placeLabel(option.address)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        </div>
      </div>

      {prefs.value !== null ? <PreferencesPanel anchor={prefsAnchor} onClose={prefs.close} /> : null}
    </nav>
  );
};

export default NavigationBar;
